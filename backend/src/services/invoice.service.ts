import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Booking, Car, Payment } from '@prisma/client';
import { ENV } from '../config/env';

export interface InvoiceData {
  booking: Booking & {
    car: Car;
    payment?: Payment | null;
    user?: { name?: string | null; firstName: string; lastName: string; email: string; phone?: string | null } | null;
  };
}

export class InvoiceService {
  /**
   * Generates a professional PDF invoice Buffer with DriveEase branding and QR verification code.
   */
  static async generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
    const { booking } = data;
    const car = booking.car;
    const payment = booking.payment;

    // Generate QR code data URL pointing to verification reference
    const qrData = `${ENV.CLIENT_URL}/booking/confirmation/${booking.bookingNumber}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 120,
      margin: 1,
      color: { dark: '#101B2D', light: '#FFFFFF' },
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `DriveEase Invoice - ${booking.bookingNumber}`,
          Author: 'DriveEase Rental Portal',
          Subject: `Rental Tax Invoice for ${car.brand} ${car.model}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // -------------------------------------------------------------
      // HEADER: Brand & Tax Invoice Title
      // -------------------------------------------------------------
      doc.rect(40, 40, 515, 60).fill('#101B2D');

      doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold')
        .text('DriveEase', 60, 52);
      doc.fontSize(9).font('Helvetica')
        .fillColor('#93C5FD')
        .text('YOUR JOURNEY, YOUR WAY', 60, 78);

      doc.fillColor('#FFFFFF').fontSize(14).font('Helvetica-Bold')
        .text('OFFICIAL TAX INVOICE', 350, 55, { align: 'right' });
      doc.fontSize(8).font('Helvetica')
        .fillColor('#E2E8F0')
        .text('ORIGINAL FOR RECIPIENT', 350, 75, { align: 'right' });

      doc.moveDown(3);

      // -------------------------------------------------------------
      // INVOICE & BOOKING METADATA STRIP
      // -------------------------------------------------------------
      const topY = 115;
      doc.fillColor('#1E293B').fontSize(9).font('Helvetica-Bold').text('INVOICE DETAILS', 40, topY);
      doc.font('Helvetica').fontSize(8).fillColor('#64748B')
        .text(`Invoice No: INV-${booking.bookingNumber}`, 40, topY + 15)
        .text(`Booking Ref: ${booking.bookingNumber}`, 40, topY + 28)
        .text(`Date of Issue: ${new Date(booking.createdAt).toLocaleDateString('en-IN')}`, 40, topY + 41)
        .text(`Payment Status: ${booking.paymentStatus}`, 40, topY + 54);

      doc.fillColor('#1E293B').fontSize(9).font('Helvetica-Bold').text('CUSTOMER INFORMATION', 200, topY);
      doc.font('Helvetica').fontSize(8).fillColor('#64748B')
        .text(`Name: ${booking.driverName}`, 200, topY + 15)
        .text(`Email: ${booking.driverEmail}`, 200, topY + 28)
        .text(`Phone: ${booking.driverPhone}`, 200, topY + 41)
        .text(`License No: ${booking.driverLicenseNumber || 'Verified On File'}`, 200, topY + 54);

      // Embed QR code on top right
      const qrImageBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
      doc.image(qrImageBuffer, 460, topY - 5, { width: 85 });
      doc.fontSize(7).fillColor('#64748B').text('Scan to Verify', 472, topY + 82);

      // -------------------------------------------------------------
      // VEHICLE & ITINERARY BOX
      // -------------------------------------------------------------
      const itinY = 215;
      doc.rect(40, itinY, 515, 65).fill('#F8FAFC').stroke('#E2E8F0');

      doc.fillColor('#2563EB').fontSize(8).font('Helvetica-Bold')
        .text('VEHICLE & ITINERARY OVERVIEW', 55, itinY + 10);

      doc.fillColor('#101B2D').fontSize(11).font('Helvetica-Bold')
        .text(`${car.brand} ${car.model} (${car.year})`, 55, itinY + 24);

      doc.fillColor('#475569').fontSize(8).font('Helvetica')
        .text(`Pickup Hub: ${booking.pickupLocation}`, 55, itinY + 42)
        .text(`Pickup: ${new Date(booking.pickupDateTime).toLocaleString('en-IN')}`, 55, itinY + 54)
        .text(`Return Hub: ${booking.dropoffLocation}`, 300, itinY + 42)
        .text(`Return: ${new Date(booking.returnDateTime).toLocaleString('en-IN')}`, 300, itinY + 54);

      // -------------------------------------------------------------
      // ITEMIZED CHARGES TABLE
      // -------------------------------------------------------------
      const tableY = 295;

      // Table Header
      doc.rect(40, tableY, 515, 22).fill('#1E293B');
      doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
        .text('DESCRIPTION', 50, tableY + 7)
        .text('RATE / BASIS', 270, tableY + 7)
        .text('DAYS / QTY', 370, tableY + 7)
        .text('AMOUNT (INR)', 450, tableY + 7, { align: 'right', width: 95 });

      let currentY = tableY + 28;

      const addTableRow = (desc: string, rate: string, qty: string, amount: string, isBold = false) => {
        doc.fillColor(isBold ? '#101B2D' : '#475569').fontSize(8)
          .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
          .text(desc, 50, currentY)
          .text(rate, 270, currentY)
          .text(qty, 370, currentY)
          .text(amount, 450, currentY, { align: 'right', width: 95 });
        currentY += 18;
      };

      // Base rental row
      const dailyPrice = Number(booking.dailyRateSnapshot || booking.dailyPrice);
      const baseAmount = Number(booking.baseAmount || booking.basePrice);
      addTableRow(
        `Base Vehicle Rental - ${car.brand} ${car.model}`,
        `INR ${dailyPrice.toLocaleString('en-IN')}/day`,
        `${booking.rentalDays} Day(s)`,
        `INR ${baseAmount.toLocaleString('en-IN')}`
      );

      // Insurance row
      const insuranceAmount = Number(booking.insuranceAmount || booking.insurancePrice);
      if (insuranceAmount > 0) {
        addTableRow(
          `Zero-Dep Damage Protection (${booking.insuranceType})`,
          'Tier Premium',
          `${booking.rentalDays} Day(s)`,
          `INR ${insuranceAmount.toLocaleString('en-IN')}`
        );
      }

      // Additional services row
      const servicesAmount = Number(booking.additionalServiceAmount || booking.servicesPrice);
      if (servicesAmount > 0) {
        addTableRow(
          'Selected In-Cabin Amenities & Services',
          'Add-ons Bundle',
          'Included',
          `INR ${servicesAmount.toLocaleString('en-IN')}`
        );
      }

      // Discount row
      const discountAmount = Number(booking.discountAmount);
      if (discountAmount > 0) {
        addTableRow(
          `Promotional Coupon Discount (${booking.couponCode || 'APPLIED'})`,
          'Discount Voucher',
          '1',
          `- INR ${discountAmount.toLocaleString('en-IN')}`
        );
      }

      // GST Tax row
      const taxAmount = Number(booking.taxAmount);
      addTableRow(
        'Goods & Services Tax (GST @ 18%)',
        'Standard Rate 18%',
        'Taxable Net',
        `INR ${taxAmount.toLocaleString('en-IN')}`
      );

      // Separator line
      doc.moveTo(40, currentY + 5).lineTo(555, currentY + 5).strokeColor('#E2E8F0').stroke();
      currentY += 12;

      // Rental Subtotal
      const rentalSubtotal = baseAmount + insuranceAmount + servicesAmount - discountAmount + taxAmount;
      addTableRow('Net Rental Subtotal (Tax Inclusive)', '', '', `INR ${rentalSubtotal.toLocaleString('en-IN')}`, true);

      // Refundable deposit (highlighted in box)
      currentY += 6;
      doc.rect(40, currentY - 4, 515, 22).fill('#FFFBEB').stroke('#FDE68A');
      doc.fillColor('#92400E').fontSize(8).font('Helvetica-Bold')
        .text('Refundable Security Deposit (Held Separately, 100% Refundable)', 50, currentY + 2)
        .text(`INR ${Number(booking.securityDeposit).toLocaleString('en-IN')}`, 450, currentY + 2, { align: 'right', width: 95 });
      currentY += 28;

      // Final Grand Total Box
      doc.rect(40, currentY, 515, 30).fill('#101B2D');
      doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica-Bold')
        .text('FINAL AMOUNT PAID / PAYABLE', 50, currentY + 10)
        .text(`INR ${Number(booking.totalAmount).toLocaleString('en-IN')}`, 430, currentY + 10, { align: 'right', width: 115 });

      currentY += 45;

      // -------------------------------------------------------------
      // FOOTER & POLICY NOTES
      // -------------------------------------------------------------
      doc.fillColor('#1E293B').fontSize(8).font('Helvetica-Bold').text('TERMS & REFUND POLICY:', 40, currentY);
      doc.font('Helvetica').fontSize(7).fillColor('#64748B')
        .text('1. Security deposit is 100% refundable upon vehicle check-in subject to standard fuel and inspection standards.', 40, currentY + 12)
        .text('2. Free cancellation is permitted up to 24 hours prior to scheduled pickup time.', 40, currentY + 22)
        .text('3. This is an official computer-generated tax invoice and requires no physical signature.', 40, currentY + 32)
        .text(`Payment Gateway Reference: ${payment?.razorpayPaymentId || payment?.transactionId || 'Test Mode / On-Hub'}.`, 40, currentY + 42);

      doc.end();
    });
  }
}
