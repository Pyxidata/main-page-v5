export type BlogItem = {
  id?: string;
  title: string;
  date: string;
  tag: string;
  content: string;
}

export type BlogItemProcessed = {
  id?: string;
  title: string;
  date: string;
  tags: string[];
  content: string;
};