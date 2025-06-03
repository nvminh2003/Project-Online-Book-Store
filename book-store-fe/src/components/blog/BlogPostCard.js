import React from "react";
import Link from "next/link";

const BlogPostCard = ({ post }) => {
  const { slug, title, excerpt, featuredImage, publishedAt, author } = post;

  const formattedDate = new Date(publishedAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white transition-shadow hover:shadow-lg">
      {featuredImage && (
        <Link href={`/blog/${slug}`}>
          <a className="block w-full h-44 overflow-hidden">
            <img
              src={featuredImage}
              alt={title}
              className="w-full h-full object-cover block"
            />
          </a>
        </Link>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/blog/${slug}`}>
          <a className="text-blue-600 text-lg font-semibold mb-2 hover:underline">
            {title}
          </a>
        </Link>
        <p className="flex-grow text-gray-700 text-base mb-3">{excerpt}</p>
        <div className="text-gray-500 text-sm">
          <span>{formattedDate}</span>
          {author && <span> - {author}</span>}
        </div>
      </div>
    </div>
  );
};

export default BlogPostCard;
