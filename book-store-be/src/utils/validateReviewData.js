// validate/reviewValidator.js

exports.validateCreateReview = (data) => {
    const errors = [];

    if (!data.book) errors.push("Vui lòng cung cấp ID sách.");
    if (!data.order) errors.push("Vui lòng cung cấp ID đơn hàng.");

    if (!data.rating || data.rating < 1 || data.rating > 5) {
        errors.push("Điểm đánh giá phải nằm trong khoảng từ 1 đến 5.");
    }

    if (!data.comment || data.comment.trim().length < 10) {
        errors.push("Nội dung đánh giá phải có ít nhất 10 ký tự.");
    }

    if (data.comment && data.comment.trim().length > 1000) {
        errors.push("Nội dung đánh giá không được vượt quá 1000 ký tự.");
    }

    if (data.images) {
        if (!Array.isArray(data.images)) {
            errors.push("Danh sách hình ảnh phải là một mảng.");
        } else if (data.images.length > 5) {
            errors.push("Bạn chỉ có thể tải lên tối đa 5 hình ảnh.");
        }
    }

    return errors;
};

exports.validateUpdateReview = ({ rating, comment, images }) => {
    const errors = [];

    if (rating !== undefined && (rating < 1 || rating > 5)) {
        errors.push("Điểm đánh giá phải nằm trong khoảng từ 1 đến 5.");
    }

    if (comment !== undefined) {
        if (comment.trim().length < 10) {
            errors.push("Nội dung đánh giá phải có ít nhất 10 ký tự.");
        }
        if (comment.trim().length > 1000) {
            errors.push("Nội dung đánh giá không được vượt quá 1000 ký tự.");
        }
    }

    if (images !== undefined) {
        if (!Array.isArray(images)) {
            errors.push("Danh sách hình ảnh phải là một mảng.");
        } else if (images.length > 5) {
            errors.push("Bạn chỉ có thể tải lên tối đa 5 hình ảnh.");
        }
    }

    return errors;
};
