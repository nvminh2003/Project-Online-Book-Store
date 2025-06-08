import React from "react";
import { Icon as Iconify } from '@iconify/react';

const icons = {
  search: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  cart: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
      <circle cx="7" cy="21" r="1" />
      <circle cx="17" cy="21" r="1" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a7.5 7.5 0 0113 0" />
    </svg>
  ),
};

/**
 * Universal Icon component using Iconify
 *
 * @param {string} name - icon name, e.g. "mdi:book-open"
 * @param {number} size - icon size in px
 * @param {string} color - icon color
 */
const Icon = ({ name, size = 24, color = 'currentColor', className = '', ...props }) => {
  return (
    <Iconify
      icon={name}
      width={size}
      height={size}
      color={color}
      className={className}
      {...props}
    />
  );
};

export default Icon;

