// Basic component prop types

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  category?: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: {
    name: string;
    title: string;
    company: string;
  };
}

export interface Client {
  id: string;
  name: string;
  logo: string;
  website?: string;
}


