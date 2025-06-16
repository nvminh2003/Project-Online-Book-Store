import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GoogleSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');

        if (accessToken && refreshToken) {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Gọi API lấy user chi tiết
            axios.get('http://localhost:9999/api/accounts/me', {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
                .then(res => {
                    if (res.data && res.data.data) {
                        localStorage.setItem('user', JSON.stringify(res.data.data));
                    }
                    navigate('/');
                    window.location.reload();
                })
                .catch(() => {
                    navigate('/auth/login');
                });
        } else {
            navigate('/auth/login');
        }
    }, [navigate]);

    return <div>Đang xác thực Google...</div>;
};

export default GoogleSuccess;