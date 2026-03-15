export type Testimonial = {
  id: string;
  name: string;
  designation?: string;
  content: string;
  image?: string | null;
  userId: string;
  star: number;
};
