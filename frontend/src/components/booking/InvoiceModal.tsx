import React, { useRef } from 'react';
import { Booking } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { Printer, Car, ShieldCheck, Download } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tax Invoice & Receipt" maxWidth="4xl">
      <div className="space-y-6">
        {/* Printable Area */}
        <div
          ref={printRef}
          className="bg-white text-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 print:p-0 print:border-none print:shadow-none"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Car className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  DriveEase
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                DriveEase Luxury Mobility Pvt. Ltd.
              </p>
              <p className="text-xs text-slate-500">
                GSTIN: 27AABCD1234E1Z5 • Mumbai Hub, BKC
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                Original Tax Invoice
              </span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {booking.bookingNumber}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Issued: {formatDateTime(booking.createdAt)}
              </p>
            </div>
          </div>

          {/* Billed To / Vehicle Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-2">
                Billed To (Driver)
              </h4>
              <p className="font-semibold text-slate-900 text-sm">{booking.driverName}</p>
              <p className="text-slate-600">{booking.driverEmail}</p>
              <p className="text-slate-600">{booking.driverPhone}</p>
              <p className="text-slate-600 font-mono mt-1">
                License: {booking.driverLicenseNumber}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-2">
                Rental Itinerary
              </h4>
              <p className="font-semibold text-slate-900 text-sm">
                {booking.car.brand} {booking.car.model} ({booking.car.year})
              </p>
              <p className="text-slate-600">
                <strong>Pickup:</strong> {formatDateTime(booking.pickupDateTime)}
              </p>
              <p className="text-slate-600">
                <strong>Return:</strong> {formatDateTime(booking.returnDateTime)}
              </p>
              <p className="text-slate-600">
                <strong>Hub:</strong> {booking.pickupLocation}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 uppercase font-semibold">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center">Duration / Qty</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 font-medium text-slate-800">
                    Vehicle Rental: {booking.car.brand} {booking.car.model}
                  </td>
                  <td className="py-3 text-center">{booking.rentalDays} Days</td>
                  <td className="py-3 text-right">
                    {formatCurrency(booking.dailyPrice)}
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {formatCurrency(booking.basePrice)}
                  </td>
                </tr>

                {Number(booking.insurancePrice) > 0 && (
                  <tr>
                    <td className="py-3 font-medium text-slate-800">
                      Damage Protection ({booking.insuranceType})
                    </td>
                    <td className="py-3 text-center">{booking.rentalDays} Days</td>
                    <td className="py-3 text-right">-</td>
                    <td className="py-3 text-right font-semibold">
                      {formatCurrency(booking.insurancePrice)}
                    </td>
                  </tr>
                )}

                {booking.services &&
                  booking.services.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-medium text-slate-800">
                        {item.service.name}
                      </td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">
                        {formatCurrency(item.pricePerUnit)}
                      </td>
                      <td className="py-3 text-right font-semibold">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}

                {Number(booking.discountAmount) > 0 && (
                  <tr className="text-emerald-700">
                    <td className="py-3 font-medium">
                      Coupon Applied ({booking.couponCode})
                    </td>
                    <td className="py-3 text-center">1</td>
                    <td className="py-3 text-right">-</td>
                    <td className="py-3 text-right font-semibold">
                      -{formatCurrency(booking.discountAmount)}
                    </td>
                  </tr>
                )}

                <tr>
                  <td className="py-3 font-medium text-slate-800">
                    Goods & Services Tax (18% GST)
                  </td>
                  <td className="py-3 text-center">CGST + SGST</td>
                  <td className="py-3 text-right">18%</td>
                  <td className="py-3 text-right font-semibold">
                    {formatCurrency(booking.taxAmount)}
                  </td>
                </tr>

                <tr className="bg-amber-50">
                  <td className="py-3 px-2 font-medium text-amber-900">
                    Security Deposit (100% Refundable upon vehicle return)
                  </td>
                  <td className="py-3 text-center text-amber-900">Held</td>
                  <td className="py-3 text-right text-amber-900">-</td>
                  <td className="py-3 px-2 text-right font-bold text-amber-900">
                    {formatCurrency(booking.securityDeposit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total & Payment Details */}
          <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-xs text-slate-500">
              <p>
                <strong>Payment Mode:</strong> {booking.payment?.paymentMethod || 'ONLINE'}
              </p>
              <p>
                <strong>Payment Status:</strong>{' '}
                <span className="font-bold text-emerald-600">
                  {booking.paymentStatus}
                </span>
              </p>
              {booking.payment?.transactionId && (
                <p>
                  <strong>Txn Ref:</strong> {booking.payment.transactionId}
                </p>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block uppercase">
                Grand Total Paid
              </span>
              <span className="text-2xl font-black text-slate-900">
                {formatCurrency(booking.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 print:hidden">
          <Button variant="secondary" size="md" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            Print / Save PDF
          </Button>
          <Button variant="outline" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
