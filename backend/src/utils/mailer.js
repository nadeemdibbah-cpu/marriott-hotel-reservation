const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendReservationConfirmation = async (guest, reservation, room) => {
  const htmlContent = `
    <h2>Reservation Confirmation</h2>
    <p>Dear ${guest.first_name} ${guest.last_name},</p>
    <p>Your reservation at Marriott Hotel has been confirmed!</p>
    <h3>Reservation Details:</h3>
    <ul>
      <li><strong>Reservation ID:</strong> #${reservation.id}</li>
      <li><strong>Room Number:</strong> ${room.room_number}</li>
      <li><strong>Room Type:</strong> ${room.room_type}</li>
      <li><strong>Check-in:</strong> ${new Date(reservation.check_in_date).toLocaleDateString()}</li>
      <li><strong>Check-out:</strong> ${new Date(reservation.check_out_date).toLocaleDateString()}</li>
      <li><strong>Number of Nights:</strong> ${reservation.number_of_nights}</li>
      <li><strong>Total Price:</strong> $${reservation.total_price.toFixed(2)}</li>
    </ul>
    <p>Thank you for choosing Marriott Hotel!</p>
    <p>Best regards,<br/>Marriott Hotel Team</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@marriott.com',
      to: guest.email,
      subject: 'Marriott Hotel Reservation Confirmation',
      html: htmlContent
    });
    console.log('Email sent successfully to', guest.email);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};

module.exports = {
  sendReservationConfirmation
};
