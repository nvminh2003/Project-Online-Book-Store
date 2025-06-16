import { toast, Toaster } from "react-hot-toast";

export const ToastManager = () => {
    return <Toaster position="top-center" reverseOrder={false} />;
};

export const notifySuccess = (message) => {
    toast.success(message);
};

export const notifyError = (message) => {
    toast.error(message);
};

export const notifyLoading = (message = "Đang xử lý...") => {
    return toast.loading(message); // Trả về toast ID
};

export const notifyUpdateSuccess = (toastId, message = "Thành công!") => {
    toast.success(message, { id: toastId });
};

export const notifyUpdateError = (toastId, message = "Lỗi!") => {
    toast.error(message, { id: toastId });
};

export const notifyDismiss = (toastId) => {
    toast.dismiss(toastId);
};
