const nodemailer = require('nodemailer');
require('dotenv').config();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendResetPasswordEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Đặt lại mật khẩu - Book Store',
        html: `
            <h1>Đặt lại mật khẩu</h1>
            <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào link bên dưới để đặt mật khẩu mới:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
            <p>Link này sẽ hết hạn sau 1 giờ.</p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const sendOrderConfirmationEmail = async (email, order) => {
    const loginUrl = `${process.env.FRONTEND_URL}/auth/login`;
    const orderDate = new Date(order.createdAt).toLocaleString('vi-VN');
    const orderStatus = {
        pending: 'Chờ xác nhận',
        confirmed: 'Đã xác nhận',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy'
    }[order.orderStatus] || order.orderStatus;

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding:8px 4px;border:1px solid #eee;">${item.book?.title || ''}</td>
            <td style="padding:8px 4px;border:1px solid #eee;text-align:center;">${item.quantity}</td>
            <td style="padding:8px 4px;border:1px solid #eee;text-align:right;">${item.price.toLocaleString('vi-VN')}đ</td>
        </tr>
    `).join('');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Xác nhận đơn hàng #${order.orderCode} - Book Store`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
                <h2 style="color:#4F46E5;">Cảm ơn bạn đã đặt hàng tại Book Store!</h2>
                <p>Xin chào <b>${order.fullName}</b>,</p>
                <p>Chúng tôi đã nhận được đơn hàng của bạn với thông tin như sau:</p>
                <h3>Thông tin đơn hàng</h3>
                <ul>
                    <li><b>Mã đơn hàng:</b> ${order.orderCode}</li>
                    <li><b>Ngày đặt:</b> ${orderDate}</li>
                    <li><b>Trạng thái:</b> ${orderStatus}</li>
                </ul>
                <h3>Thông tin nhận hàng</h3>
                <ul>
                    <li><b>Họ tên:</b> ${order.fullName}</li>
                    <li><b>Địa chỉ:</b> ${order.address}</li>
                    <li><b>Số điện thoại:</b> ${order.phone}</li>
                </ul>
                <h3>Danh sách sản phẩm</h3>
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="background:#f3f4f6;">
                            <th style="padding:8px 4px;border:1px solid #eee;text-align:left;">Sản phẩm</th>
                            <th style="padding:8px 4px;border:1px solid #eee;text-align:center;">Số lượng</th>
                            <th style="padding:8px 4px;border:1px solid #eee;text-align:right;">Giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <div style="margin-top:16px;text-align:right;">
                    <p><b>Tạm tính:</b> ${((order.totalAmount || 0) - (order.shippingFee || 0) + (order.discountAmount || 0)).toLocaleString('vi-VN')}đ</p>
                    <p><b>Phí vận chuyển:</b> ${(order.shippingFee || 0).toLocaleString('vi-VN')}đ</p>
                    <p><b>Giảm giá:</b> -${(order.discountAmount || 0).toLocaleString('vi-VN')}đ</p>
                    <p style="font-size:1.2em;"><b>Tổng thanh toán:</b> ${(order.totalAmount || 0).toLocaleString('vi-VN')}đ</p>
                </div>
                <hr>
      <p>Để kiểm tra trạng thái đơn hàng, vui lòng đăng nhập vào tài khoản:</p>
      <p><a href="${loginUrl}" style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Đăng nhập vào tài khoản</a></p>
                <p style="margin-top:24px;">Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a> để được hỗ trợ.</p>
                <p style="color:#4F46E5;">Book Store xin cảm ơn quý khách!</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return false;
    }
};

const sendAccountLockedEmail = async (email, fullName) => {
    const loginUrl = `${process.env.FRONTEND_URL}/auth/login`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Tài khoản của bạn đã bị khóa tạm thời',
        html: `
            <h2>Thông báo khóa tài khoản</h2>
            <p>Xin chào <b>${fullName || email}</b>,</p>
            <p>Tài khoản của bạn trên hệ thống <b>Book Store</b> đã bị <b>khóa tạm thời</b>.</p>
            <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a> hoặc số điện thoại <b>097 4148 047</b>.</p>
             <hr>
            <p><a href="${loginUrl}" style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Đăng nhập vào tài khoản</a></p>
            <p>Trân trọng,<br>Đội ngũ Book Store</p>
        `
    };
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending account locked email:', error);
        return false;
    }
};

const sendAccountUnlockedEmail = async (email, fullName) => {
    const loginUrl = `${process.env.FRONTEND_URL}/auth/login`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Tài khoản của bạn đã được mở khóa',
        html: `
            <h2>Thông báo mở khóa tài khoản</h2>
            <p>Xin chào <b>${fullName || email}</b>,</p>
            <p>Tài khoản của bạn trên hệ thống <b>Book Store</b> đã được <b>mở khóa</b>. Bạn có thể đăng nhập và sử dụng dịch vụ bình thường.</p>
            <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a> hoặc số điện thoại <b>097 4148 047</b>.</p>
            <hr>
            <p><a href="${loginUrl}" style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Đăng nhập vào tài khoản</a></p>
            <p>Trân trọng,<br>Đội ngũ Book Store</p>
        `
    };
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending account unlocked email:', error);
        return false;
    }
};

module.exports = {
    sendResetPasswordEmail,
    sendOrderConfirmationEmail,
    sendAccountLockedEmail,
    sendAccountUnlockedEmail
}; 