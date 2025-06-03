import React from "react";
import styles from "./BlogDetailView.module.css";

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
    <article className={styles.blogDetail}>
      <h1 className={styles.title}>{title}</h1>
      {featuredImage && (
        <img src={featuredImage} alt={title} className={styles.featuredImage} />
      )}
      <div className={styles.meta}>
        <span className={styles.date}>{formattedDate}</span>
        {author && <span className={styles.author}> - {author}</span>}
      </div>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {(categories?.length > 0 || tags?.length > 0) && (
        <div className={styles.taxonomy}>
          {categories?.length > 0 && (
            <div className={styles.categories}>
              <strong>Chuyên mục: </strong>
              {categories.join(", ")}
            </div>
          )}
          {tags?.length > 0 && (
            <div className={styles.tags}>
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
