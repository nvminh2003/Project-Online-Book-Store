const axios = require('axios');

// === Cấu hình thông tin cần thiết ===
const API_BASE = 'http://localhost:9999/api'; // Đổi port nếu backend chạy port khác
const PRODUCT_ID = '6874dc45b2d6a1eccb7951b6'; // Thay bằng _id sản phẩm còn 1 trong kho
const TOKEN_A = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NWVjODcyZTQ2NDRkNmMxYWYzMmQ4MyIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc1MjY2NzQ5MSwiZXhwIjoxNzUyNjcxMDkxfQ.6JXh1wWIcDOC81tITMrmvsf4bv_0VROVlvM6t3BU3MY'; // Thay bằng access token tài khoản A
const TOKEN_B = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjJjYjEyZTRiMmIyYzljZWU2NjhiMSIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc1MjY2NzUxMCwiZXhwIjoxNzUyNjcxMTEwfQ.D7XsGqYyxZFKijeJXKBBw8zJkER8sv6AnY8lgsnitwU'; // Thay bằng access token tài khoản B

// Hàm thêm sản phẩm vào giỏ hàng
async function addToCart(token) {
    return axios.post(`${API_BASE}/cart/add`, {
        items: [{ bookId: PRODUCT_ID, quantity: 1 }]
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

// Hàm tạo đơn hàng
async function createOrder(token) {
    return axios.post(`${API_BASE}/orders`, {
        fullName: 'Test User',
        phone: '0123456789',
        address: 'Test Address',
        paymentMethod: 'COD'
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

(async () => {
    try {
        // Bước 1: Cả 2 user thêm sản phẩm vào giỏ hàng
        await Promise.all([addToCart(TOKEN_A), addToCart(TOKEN_B)]);
        console.log('Cả 2 user đã thêm sản phẩm vào giỏ hàng.');

        // Bước 2: Gửi 2 request đặt hàng đồng thời
        const users = [
            { token: TOKEN_A, name: 'User A' },
            { token: TOKEN_B, name: 'User B' },
        ];

        // Shuffle thứ tự
        users.sort(() => Math.random() - 0.5);

        // Gửi request đặt hàng đồng thời
        console.log(`Bắt đầu gửi request đặt hàng cho ${users[0].name} và ${users[1].name} vào:`, new Date().toISOString());
        const [res1, res2] = await Promise.allSettled([
            createOrder(users[0].token),
            createOrder(users[1].token),
        ]);

        // In kết quả tương ứng với user
        console.log(`Kết quả đặt hàng ${users[0].name}:`, res1.status, res1.value?.data || res1.reason?.response?.data);
        console.log(`Kết quả đặt hàng ${users[1].name}:`, res2.status, res2.value?.data || res2.reason?.response?.data);

    } catch (err) {
        if (err.response) {
            console.error('Lỗi khi test:', err.response.data);
        } else {
            console.error('Lỗi khi test:', err.message || err);
        }
    }
})(); 