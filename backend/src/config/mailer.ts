import nodemailer from 'nodemailer';
import { ENV } from './env';

let transporter: nodemailer.Transporter | null = null;

export const getMailer = async (): Promise<nodemailer.Transporter> => {
  if (transporter) return transporter;

  if (ENV.NODE_ENV === 'production' && ENV.SMTP_USER && ENV.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_PORT === 465,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
    });
  } else {
    // Development fallback using Ethereal test account or dummy transport
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 Created Ethereal test mailer account:', testAccount.user);
    } catch {
      // Stream transport fallback if network fails
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      console.log('📧 Using local JSON mailer transport');
    }
  }

  return transporter;
};

export interface BookingEmailPayload {
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  carName: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  totalAmount: number;
}

export const sendBookingConfirmationEmail = async (payload: BookingEmailPayload) => {
  try {
    const mail = await getMailer();
    const info = await mail.sendMail({
      from: ENV.EMAIL_FROM,
      to: payload.customerEmail,
      subject: `🚗 Booking Confirmed: ${payload.bookingNumber} - DriveEase`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 8px;">
          <div style="background: #0f172a; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #38bdf8; margin: 0; font-size: 26px; letter-spacing: 1px;">DriveEase</h1>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">Premium Automotive Rentals</p>
          </div>
          
          <div style="background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
            <h2 style="color: #0f172a; font-size: 20px;">Reservation Confirmed</h2>
            <p style="color: #475569;">Hello <strong>${payload.customerName}</strong>,</p>
            <p style="color: #475569;">Your luxury rental reservation has been successfully confirmed. Below are your travel details:</p>
            
            <div style="background: #f1f5f9; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 4px 0; color: #334155;"><strong>Booking Reference:</strong> <span style="color: #2563eb; font-weight: bold;">${payload.bookingNumber}</span></p>
              <p style="margin: 4px 0; color: #334155;"><strong>Vehicle:</strong> ${payload.carName}</p>
              <p style="margin: 4px 0; color: #334155;"><strong>Pickup:</strong> ${payload.pickupDate} (${payload.pickupLocation})</p>
              <p style="margin: 4px 0; color: #334155;"><strong>Return:</strong> ${payload.returnDate} (${payload.dropoffLocation})</p>
              <p style="margin: 4px 0; color: #334155;"><strong>Total Amount Paid:</strong> ₹${payload.totalAmount.toLocaleString('en-IN')}</p>
            </div>

            <p style="color: #64748b; font-size: 14px;">Please present your original valid Driver's License and Government ID during vehicle handover.</p>
            <p style="color: #475569; margin-top: 24px;">Safe travels,<br><strong>The DriveEase Team</strong></p>
          </div>
        </div>
      `,
    });

    console.log(`✉️ Booking confirmation email dispatched for ${payload.bookingNumber}:`, info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to dispatch confirmation email:', error);
    // Non-blocking for user booking
    return null;
  }
};
