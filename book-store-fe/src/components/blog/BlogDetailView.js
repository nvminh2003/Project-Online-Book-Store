import React from "react";

const BlogDetailView = ({ post }) => {
  const {
    title,
    featuredImage,
    content,
    author,
    publishedAt,
    categories,
    tags,
  } = post;

  const formattedDate = new Date(publishedAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="prose max-w-none">
      <h1 className="font-bold text-3xl mb-4">{title}</h1>
      {featuredImage && (
        <img src={featuredImage} alt={title} className="w-full mb-6 rounded" />
      )}
      <div className="text-gray-500 text-sm mb-4">
        <span>{formattedDate}</span>
        {author && <span> - {author}</span>}
      </div>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {(categories?.length > 0 || tags?.length > 0) && (
        <div className="mt-6">
          {categories?.length > 0 && (
            <div className="mb-2">
              <strong>Chuyên mục: </strong>
              {categories.join(", ")}
            </div>
          )}
          {tags?.length > 0 && (
            <div>
              <strong>Tags: </strong>
              {tags.join(", ")}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default BlogDetailView;
