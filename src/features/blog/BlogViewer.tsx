import React, { useState, useEffect } from 'react';
import { SpacerStyle } from '../../shared/styles/SpacerStyle.ts';
import { useUserStore } from '../../shared/stores/userStore.tsx';
import styles from '../../shared/css/thickScrollbar.module.css';
import Text from '../../shared/components/texts/Text.tsx';
import Spacer from '../../shared/components/spacers/Spacer.tsx';
import { onValue, ref, set } from 'firebase/database';
import { database } from '../../firebase-config.ts';
import { stringToTags } from '../../util/functions.tsx';
import { TextStyle } from '../../shared/styles/TextStyle.ts';
import AnimatedHorizontalLine from '../../shared/components/decorations/AnimatedHorizontalLines.tsx';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import BackButton from '../../shared/components/buttons/BackButton.tsx';
import { BlogItem } from './types/blogItem.tsx';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import EditableText from '../../shared/components/editables/EditableText.tsx';
import EditableField from '../../shared/components/editables/EditableField.tsx';

type BlogViewerProps = {
  initialBlogData: BlogItem;
  onBack: () => void;
};

export default function BlogViewer({ initialBlogData, onBack }: BlogViewerProps): JSX.Element {
  const [blogPost, setBlogPost] = useState<BlogItem>(initialBlogData);
  const { isEditMode } = useUserStore();

  useEffect(() => {
    if (!blogPost.id) return;

    const blogRef = ref(database, `blogs/${blogPost.id}`);
    const unsubscribe = onValue(blogRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBlogPost({ id: blogPost.id, ...data });
      }
    }, (dbError) => {
      console.error("Firebase fetch error:", dbError);
    });

    return () => unsubscribe();
  }, [blogPost.id]);

  const currentTags = stringToTags(blogPost.tag);
  const contentWithLineBreaks = blogPost.content.replace(/\n/g, '<br/>\n\n\n');

  return (
    <div className="w-screen flex justify-center overflow-y-auto no-scrollbar">
      <motion.div 
        className="w-full flex flex-col p-4 sm:p-8 lg:p-0 lg:max-w-[800px]"
        initial={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: 50 }}
        transition={{
          duration: 0.3
        }}
      >
        
        <motion.div
          className='absolute top-0 sm:top-4 -left-5 sm:left-6 z-[900]'
          initial={{ opacity: 0, translateX: 50 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: 0, transition: {delay:0} }}
          transition={{
            duration: 0.5,
            delay: 0.5
          }}
        >
          <BackButton onClick={onBack} />
        </motion.div>
        
        <Spacer className={SpacerStyle.Article}/>
        <EditableText
          key={"title"}
          defaultText={blogPost.title}
          className={TextStyle.Title}
          path={`blogs/${blogPost.id}`}
          field="title"
          label="Title text"
          animate
          animationDuration={1500}
        />
        <Spacer className={SpacerStyle.Item}/>
        <Text
          text={"posted: " + blogPost.date + "\nauthor: pyxidata"}
          className={TextStyle.Description}
        />
        <Spacer className={SpacerStyle.Title}/>

        {currentTags.length > 0 && (
          <>
            <div className="flex justify-center items-center gap-2 mb-4">
              { currentTags.map((tag, index) => (
                <span key={index} className="bg-white/10 text-xs sm:text-sm px-2 py-1 border border-white/50">
                  {tag}
                </span>
              ))}
            </div>
            <Spacer className={SpacerStyle.Label}/>
          </>
        )}
        <Spacer className={SpacerStyle.Item}/>

        <motion.div
          initial={{ opacity: 0}}
          animate={{ opacity: 1}}
          exit={{ opacity: 0}}
          transition={{
            duration: 0.2,
            delay: 0.2
          }}
        >          
          <AnimatedHorizontalLine stay/>
        </motion.div>

        <Spacer className={SpacerStyle.Title}/>

        <div className={`flex w-full md:max-w-[800px] px-4 sm:px-8 lg:px-0 ${isEditMode ? 'flex-col' : 'flex-col'}`}>
          {isEditMode && (
            <>
              <EditableField
                defaultValue={blogPost.tag || ""}
                path={`blogs/${blogPost.id}`}
                field="tag"
                label="tag"
              />
              <EditableField
                defaultValue={blogPost.date || ""}
                path={`blogs/${blogPost.id}`}
                field="date"
                label="date"
                type="date"
              />
              <EditableField
                defaultValue={blogPost.content || ""}
                path={`blogs/${blogPost.id}`}
                field="content"
                label="content"
                useTextArea
              />
            </>
          )}
          {!isEditMode && (
            <motion.div 
              className={`w-full rounded-lg flex flex-col flex-grow`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div
                className={`prose prose-invert w-full text-start md:max-w-[800px] overflow-y-auto overflow-x-clip flex-grow opacity-70 pt-4 text-xs sm:text-sm`}
                style={{ lineHeight: 0.5 }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeRaw]}
                  children={contentWithLineBreaks}
                  components={{
                    code({ node, className, children, ref, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return node && match ? (
                        <SyntaxHighlighter
                          {...props}
                          style={atomDark}
                          language={match[1]}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code {...props} className={className}>
                          {children}
                        </code>
                      );
                    },
                  }}
                />
              </div>
            </motion.div>
          )}
        </div>
        &nbsp;
      </motion.div>
    </div>
  );
}