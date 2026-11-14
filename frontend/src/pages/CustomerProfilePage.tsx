import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { documentApi } from '../services/document.api';
import { api } from '../lib/api';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  Upload,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  Loader2,
  Camera,
  X,
} from 'lucide-react';

export const CustomerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, updateUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Profile Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Driving License Document Form state
  const [licenseNumber, setLicenseNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docSuccess, setDocSuccess] = useState('');
  const [docError, setDocError] = useState('');

  // Document image viewer modal
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const [viewingImageTitle, setViewingImageTitle] = useState<string>('');

  // Sync inputs
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setLicenseNumber(user.drivingLicenseNumber || '');
    }
  }, [user]);

  // Protect route
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login?redirect=/dashboard/profile');
    }
  }, [isAuthLoading, isAuthenticated, navigate]);

  // Fetch documents
  const { data: documents = [], isLoading: isDocsLoading } = useQuery({
    queryKey: ['my-documents'],
    queryFn: documentApi.getMyDocuments,
    enabled: isAuthenticated,
  });

  const licenseDoc = documents.find((d) => d.documentType === 'DRIVING_LICENSE');

  useEffect(() => {
    if (licenseDoc) {
      if (licenseDoc.documentNumber) setLicenseNumber(licenseDoc.documentNumber);
      if (licenseDoc.expiryDate) {
        setExpiryDate(new Date(licenseDoc.expiryDate).toISOString().split('T')[0]);
      }
    }
  }, [licenseDoc]);

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const data = await api.patch<{ user: any }>('/users/profile', {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        phone,
      });

      updateUser(data.user);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile information.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.patch('/users/change-password', {
        currentPassword,
        newPassword,
      });

      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password. Verify your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Document Upload
  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseNumber.trim()) {
      setDocError('Driving license number is required.');
      return;
    }

    setIsUploadingDoc(true);
    setDocSuccess('');
    setDocError('');

    try {
      const formData = new FormData();
      formData.append('documentType', 'DRIVING_LICENSE');
      formData.append('documentNumber', licenseNumber.trim());
      if (expiryDate) formData.append('expiryDate', expiryDate);
      if (frontFile) formData.append('frontImage', frontFile);
      if (backFile) formData.append('backImage', backFile);

      await documentApi.uploadDocument(formData);
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });

      setDocSuccess('Driving license uploaded successfully! Pending review.');
      setFrontFile(null);
      setBackFile(null);
      setFrontPreview(null);
      setBackPreview(null);
      setTimeout(() => setDocSuccess(''), 4000);
    } catch (err: any) {
      setDocError(err.message || 'Failed to upload document.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Handle Delete Document
  const handleDeleteDoc = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;
    try {
      await documentApi.deleteDocument(id);
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    }
  };

  // Front file selector
  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFrontFile(file);
      setFrontPreview(URL.createObjectURL(file));
    }
  };

  // Back file selector
  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackFile(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="py-24 max-w-5xl mx-auto px-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#2563EB] mx-auto mb-3" />
        <p className="text-xs text-[#64748B]">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#101B2D]"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="text-xs text-slate-400 font-medium">Customer Profile & Security</span>
        </div>

        {/* Section 1: Driving License & Document Management */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
                Verification Documents
              </span>
              <h2 className="text-xl font-black text-[#101B2D] mt-0.5">
                Driving License & Identity Verification
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Upload a clear copy of your driving license for instant hub pickup approval.
              </p>
            </div>

            {licenseDoc && (
              <Badge
                variant={
                  licenseDoc.verificationStatus === 'VERIFIED'
                    ? 'success'
                    : licenseDoc.verificationStatus === 'REJECTED'
                    ? 'danger'
                    : 'warning'
                }
                size="md"
              >
                {licenseDoc.verificationStatus === 'VERIFIED'
                  ? 'Verified Driver'
                  : licenseDoc.verificationStatus === 'REJECTED'
                  ? 'Verification Rejected'
                  : 'Pending Review'}
              </Badge>
            )}
          </div>

          {docSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{docSuccess}</span>
            </div>
          )}

          {docError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{docError}</span>
            </div>
          )}

          {licenseDoc?.rejectionReason && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600" /> Action Required:
              </span>
              <p className="text-[11px] text-rose-700">
                {licenseDoc.rejectionReason} - Please upload a clearer photo.
              </p>
            </div>
          )}

          {/* Current Uploaded Document Summary */}
          {licenseDoc && (licenseDoc.hasFrontImage || licenseDoc.hasBackImage) && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#101B2D]">Current Active Document on File:</span>
                <button
                  type="button"
                  onClick={() => handleDeleteDoc(licenseDoc.id)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Document
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {licenseDoc.hasFrontImage && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-medium text-slate-700">Front Copy</span>
                    <button
                      type="button"
                      onClick={() => {
                        setViewingImageUrl(documentApi.getDocumentFileUrl(licenseDoc.id, 'front'));
                        setViewingImageTitle('Driving License - Front Side');
                      }}
                      className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Photo
                    </button>
                  </div>
                )}

                {licenseDoc.hasBackImage && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-medium text-slate-700">Back Copy</span>
                    <button
                      type="button"
                      onClick={() => {
                        setViewingImageUrl(documentApi.getDocumentFileUrl(licenseDoc.id, 'back'));
                        setViewingImageTitle('Driving License - Back Side');
                      }}
                      className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Photo
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload / Replace Document Form */}
          <form onSubmit={handleDocSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#101B2D] block mb-1">
                  Driving License Number *
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. DL-0420110012345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-medium uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-[#101B2D] block mb-1">
                  License Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>
            </div>

            {/* Front & Back File Upload Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Front File */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="frontImageInput"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFrontFileChange}
                  className="hidden"
                />
                <label htmlFor="frontImageInput" className="cursor-pointer block space-y-2">
                  {frontPreview ? (
                    <img src={frontPreview} alt="Front preview" className="w-full h-24 object-cover rounded-lg mx-auto" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
                      <Camera className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-[#101B2D] block">
                      {frontFile ? frontFile.name : 'Upload License Front Photo'}
                    </span>
                    <span className="text-[10px] text-[#64748B]">JPEG, PNG, WEBP, PDF up to 5MB</span>
                  </div>
                </label>
              </div>

              {/* Back File */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="backImageInput"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleBackFileChange}
                  className="hidden"
                />
                <label htmlFor="backImageInput" className="cursor-pointer block space-y-2">
                  {backPreview ? (
                    <img src={backPreview} alt="Back preview" className="w-full h-24 object-cover rounded-lg mx-auto" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
                      <Camera className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-[#101B2D] block">
                      {backFile ? backFile.name : 'Upload License Back Photo'}
                    </span>
                    <span className="text-[10px] text-[#64748B]">JPEG, PNG, WEBP, PDF up to 5MB</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" disabled={isUploadingDoc}>
                {isUploadingDoc ? 'Uploading Documents...' : 'Save & Submit License'}
              </Button>
            </div>
          </form>
        </div>

        {/* Section 2: Personal Profile Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
              Driver Details
            </span>
            <h2 className="text-xl font-black text-[#101B2D] mt-0.5">
              Personal Information
            </h2>
          </div>

          {profileSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#101B2D] block mb-1">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-[#101B2D] block mb-1">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#101B2D] block mb-1">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Email verification is tied to your account login.
                </span>
              </div>

              <div>
                <label className="font-bold text-[#101B2D] block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" disabled={isSavingProfile}>
                {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </div>

        {/* Section 3: Change Password */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
              Security & Credentials
            </span>
            <h2 className="text-xl font-black text-[#101B2D] mt-0.5">
              Change Password
            </h2>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs max-w-md">
            <div>
              <label className="font-bold text-[#101B2D] block mb-1">Current Password *</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-[#101B2D] block mb-1">New Password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-[#101B2D] block mb-1">Confirm New Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" disabled={isChangingPassword}>
                {isChangingPassword ? 'Updating Password...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* DOCUMENT IMAGE VIEWER MODAL */}
      {viewingImageUrl && (
        <Modal
          isOpen={Boolean(viewingImageUrl)}
          onClose={() => setViewingImageUrl(null)}
          title={viewingImageTitle}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-2xl p-2 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={viewingImageUrl}
                alt="Document copy"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setViewingImageUrl(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
