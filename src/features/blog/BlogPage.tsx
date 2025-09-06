import React, { useState, useEffect, useMemo, SetStateAction, Dispatch } from 'react';
import { SpacerStyle } from '../../shared/styles/SpacerStyle.ts';
import { useUserStore } from '../../shared/stores/userStore.tsx';
import Spacer from '../../shared/components/spacers/Spacer.tsx';
import Text from '../../shared/components/texts/Text.tsx';
import { database } from '../../firebase-config.ts';
import { onValue, push, ref, remove, set } from 'firebase/database';
import { stringToTags } from '../../util/functions.tsx';
import { TextStyle } from '../../shared/styles/TextStyle.ts';
import EditableText from '../../shared/components/editables/EditableText.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../shared/components/buttons/Button.tsx';
import AnimatedHorizontalLine from '../../shared/components/decorations/AnimatedHorizontalLines.tsx';
import Spinner from '../../shared/components/decorations/Spinner.tsx';
import TextField from '../../shared/components/inputs/TextField.tsx';

// Assuming you have a types/BlogItem.ts file
type BlogItem = {
  id?: string;
  title: string;
  date: string;
  tag: string;
  content: string;
};

// Assuming you have a file for the BlogViewer component logic
import BlogViewer from './BlogViewer.tsx';
import { cn } from '../../util/cn.tsx';

export default function BlogPage({
  setIsBlogItemOpen,
} : {
  setIsBlogItemOpen: Dispatch<SetStateAction<boolean>>
}): JSX.Element {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAddingBlog, setIsAddingBlog] = useState<boolean>(false);
  const [introText, setIntroText] = useState("");
  const [addInitDelay, setAddInitDelay] = useState(true);
  const { isEditMode } = useUserStore();
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);

  useEffect(() => {
    const blogsRef = ref(database, 'blogs');
    const unsubscribe = onValue(blogsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedBlogs: BlogItem[] = [];
      if (data) {
        Object.keys(data).forEach((key) => {
          if (key === 'introText') {
            setIntroText(data[key]);
          } else {
            loadedBlogs.push({
            id: key,
            ...data[key],
          });
          }
        });
      }
      setBlogs(loadedBlogs);
    });

    setTimeout(() => {
      setAddInitDelay(false);
    }, 2000);

    return () => unsubscribe();
  }, []);

  useEffect(() => { 
    setIsBlogItemOpen(selectedBlog != null)
  }, [selectedBlog]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    blogs.forEach(blog => {
      stringToTags(blog.tag).forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [blogs]);

  const filteredAndSortedBlogs = useMemo(() => {
    let currentBlogs = blogs.filter(blog => {
      const blogTags = stringToTags(blog.tag);

      const matchesSearch =
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.tag.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some(selectedTag => blogTags.includes(selectedTag));

      return matchesSearch && matchesTags;
    });

    if (sortOrder === 'asc') {
      currentBlogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortOrder === 'desc') {
      currentBlogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return currentBlogs;
  }, [blogs, searchQuery, sortOrder, selectedTags]);

  const handleBlogClick = (blog: BlogItem) => {
    setSelectedBlog(blog);
  };

  const handleAddBlog = async () => {
    if (isAddingBlog) return;
    setIsAddingBlog(true);

    const newBlog: BlogItem = {
      title: 'New Blog Post',
      date: new Date().toISOString().split('T')[0],
      tag: '#draft',
      content: `# New Blog Post\n\nStart writing your amazing content here!`,
    };
    try {
      const newBlogRef = push(ref(database, 'blogs'));
      await set(newBlogRef, newBlog);
      // Navigate to the newly created blog within the same page
      setSelectedBlog({ ...newBlog, id: newBlogRef.key! });
    } catch (error) {
      console.error("Error adding new blog: ", error);
    } finally {
      setIsAddingBlog(false);
    }
  };

  const handleRemoveBlog = async (blogId: string) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await remove(ref(database, `blogs/${blogId}`));
        if (selectedBlog?.id === blogId) {
          setSelectedBlog(null);
        }
      } catch (error) {
        console.error("Error removing blog: ", error);
      }
    }
  };

  const handleRemoveSelectedTag = (tagToRemove: string) => {
    setSelectedTags(prevSelectedTags => prevSelectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const tag = event.target.value;
    setSelectedTags(prevSelectedTags => {
      if (prevSelectedTags.includes(tag)) {
        return prevSelectedTags.filter(t => t !== tag);
      } else {
        return [...prevSelectedTags, tag];
      }
    });
  };

  if (selectedBlog) {
    return (
      <div className="w-full h-full flex items-top justify-center">
        <div className="w-full flex flex-col items-center p-4 sm:p-8 lg:p-0 lg:max-w-[800px]">
          <BlogViewer
            initialBlogData={selectedBlog}
            onBack={() => setSelectedBlog(null)}
          />
        </div>
      </div>
    );
  }

  return (
      <motion.div 
        className="w-full h-full flex items-top justify-center overflow-y-auto no-scrollbar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.5,
          delay: addInitDelay ? 2 : 0
        }}
      >
        <div className="fixed hidden h-full justify-center 2xl:flex flex-col w-[calc((100vw-800px)/2)] left-0 pl-16 pr-24">
          <Text
            text="pyxidata blog"
            className={TextStyle.Subtitle}
          />
          <Spacer className={SpacerStyle.Title} />
          <EditableText
            key={introText}
            defaultText={introText}
            className={cn(TextStyle.Description, "text-start whitespace-pre-wrap")}
            useTextArea
            path="blogs"
            field="introText"
            label="Introduction text"
            animate
            animationDuration={1500}
          />
        </div>
        <div className="w-full px-4 lg:px-0 md:max-w-[800px]">
          <Spacer className="h-[20vh]" />
          <div className="2xl:hidden">
            <Text
              text="pyxidata blog"
              className={TextStyle.Title + " text-center"}
            />
            <Spacer className="h-[10vh]" />
          </div>
          <div className="flex flex-col w-full">
            <TextField
              className='h-12'
              placeholder="search blogs"
              value={searchQuery}
              onChange={(query) => setSearchQuery(query)}
            />
            <Spacer className={SpacerStyle.Paragraph} />
            <div className="flex justify-end items-center">
              <select
                value=""
                onChange={handleTagSelection}
                className="flex-grow p-3 bg-transparent hover:bg-neutral-800 border border-white/50 focus:outline-none transition-colors h-12"
              >
                <option value="" disabled hidden>tag</option>
                {uniqueTags.map(tag => (
                  !selectedTags.includes(tag) &&
                  <option
                    className=""
                    key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <Spacer className={SpacerStyle.Paragraph} />
              <Button
                text="clear"
                onClick={() => setSelectedTags([])}
                disabled={selectedTags.length === 0}
                className="w-20 h-12"
              />
            </div>
            {selectedTags.length > 0 && (
              <>
                <Spacer className={SpacerStyle.Paragraph} />
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <span
                      key={`selected-${tag}`}
                      className="flex items-center bg-white/10 text-sm px-2 py-1 border border-white/50"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveSelectedTag(tag)}
                        className="ml-2 hover:text-red-300 font-bold transition-colors"
                        aria-label={`Remove tag ${tag}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </>
            )}
            <Spacer className={SpacerStyle.Paragraph} />
            <div className="flex justify-end items-center">
              <Text
                text="sort by:"
                className={TextStyle.Body}
              />
              <Spacer className={SpacerStyle.Label} />
              <Button
                text="oldest"
                onClick={() => setSortOrder('asc')}
                className={`rounded-lg text-sm ${sortOrder === 'asc' && 'bg-white/70 hover:bg-white/90 border-white text-black'} w-20`}
              />
              <Spacer className={SpacerStyle.Paragraph} />
              <Button
                text="newest"
                onClick={() => setSortOrder('desc')}
                className={`rounded-lg text-sm ${sortOrder === 'desc' && 'bg-white/70 hover:bg-white/90 border-white text-black'} w-20`}
              />
            </div>
            <Spacer className={SpacerStyle.Item} />
            {isEditMode && (
              <>
                <button
                  onClick={handleAddBlog}
                  disabled={isAddingBlog}
                  className={`py-2 px-4 rounded-lg font-bold transition-colors duration-200 ${isAddingBlog ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  {isAddingBlog ? 'Adding Blog...' : 'Add New Blog'}
                </button>
                <Spacer className={SpacerStyle.Item} />
              </>
            )}
            <AnimatedHorizontalLine stay/>
            <Spacer className={SpacerStyle.Item} />
            <AnimatePresence mode="wait">
              {filteredAndSortedBlogs.length === 0 && (searchQuery !== '' || selectedTags.length > 0 || blogs.length > 0) ? (
                <motion.div
                  key="no-match"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Text
                    text="No matching blogs found."
                    className={TextStyle.Body + " text-center"}
                  />
                </motion.div>
              ) : filteredAndSortedBlogs.length === 0 && blogs.length === 0 ? (
                <motion.div
                  key="loading-icon"
                  className="w-full h-full flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Spinner />
                </motion.div>
              ) : (
                <motion.ul
                  key="blog-list"
                  className="space-y-2 sm:space-y-4 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {filteredAndSortedBlogs.map((blog, index) => (
                    <motion.li
                      key={blog.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: (addInitDelay ? 0 : 0) + index * 0.1 }}
                      className="flex items-center justify-between bg-transparent hover:bg-white/10 p-4 transition-colors border border-white/50"
                    >
                      <button
                        onClick={() => handleBlogClick(blog)}
                        className="flex-grow text-left text-lg font-semibold text-white focus:outline-none"
                      >
                        <div className='w-full flex justify-between'>
                          <Text
                            text={`${blog.title}`}
                            className={TextStyle.Body}
                          />
                          <Text
                            text={`${blog.date}`}
                            className={TextStyle.Description}
                          />
                        </div>
                        <Spacer className={SpacerStyle.Label} />
                        {stringToTags(blog.tag).length > 0 && (
                          <div className="block text-sm text-gray-400 mt-1 flex flex-wrap gap-2">
                            { stringToTags(blog.tag).map((t, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="text-xs px-1 py-0.5 border border-white/50 bg-white/10"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                    </button>
                    {isEditMode && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveBlog(blog.id!); }}
                        className="ml-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md transition-colors duration-200"
                      >
                        Remove
                      </button>
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
        <Spacer className={SpacerStyle.Article} />
      </div>
    </motion.div>
  );
}