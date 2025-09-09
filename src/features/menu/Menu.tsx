import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue, push, remove, set, get } from 'firebase/database';
import PageLayout from '../../shared/components/layouts/PageLayout';
import { cn } from '../../util/cn';
import { MenuList } from './components/MenuList';
import BackButton from '../../shared/components/buttons/BackButton';
import AboutMe from './components/AboutMe';
import { useUserStore } from '../../shared/stores/userStore';
import Comms from './components/Comms';
import Misc from './components/Misc';
import Gallery from './components/Gallery';
import BlogPage from '../blog/BlogPage';
import { TextStyle } from '../../shared/styles/TextStyle';
import EditableField from '../../shared/components/editables/EditableField';

const auth = getAuth();
const db = getDatabase();

enum MenuState { Init, Default, About, Comms, Blog, Gallery, Misc }

export default function Menu() {
  const [showLogin, setShowLogin] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bgLinks, setBgLinks] = useState<{ [key: string]: string }>({});
  const [newLink, setNewLink] = useState('');
  const [newKey, setNewKey] = useState(''); // New state for the key of the new link
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newKeyInput, setNewKeyInput] = useState('');
  const [menuState, setMenuState] = useState<MenuState>(MenuState.Init);
  const [menuListVisible, setMenuListVisible] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [isBlogItemOpen, setIsBlogItemOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { isEditMode, setEditMode } = useUserStore();

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
      setMessage('login successful!');
    } catch (error) {
      console.error("sign-in failed:", error);
      setMessage(`Sign-in failed. Please check your credentials.`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setMessage('signed out successfully.');
    } catch (error) {
      console.error("Sign-out failed:", error);
      setMessage(`Sign-out failed. Please try again.`);
    }
  };

  const handleAddLink = () => {
    if (newLink.trim() !== '' && newKey.trim() !== '') {
      set(ref(db, `bg/${newKey}`), newLink)
        .then(() => {
          setNewLink('');
          setNewKey('');
        })
        .catch(error => {
          console.error("Error adding link:", error);
        });
    } else {
      setMessage("Both key and link are required to add a new item.");
    }
  };

  const handleRemoveLink = (key: string) => {
    remove(ref(db, `bg/${key}`))
      .catch(error => {
        console.error("Error removing link:", error);
      });
  };

  const handleEditLink = (key: string, newUrl: string) => {
    if (newUrl.trim() !== '') {
      set(ref(db, `bg/${key}`), newUrl)
        .catch(error => {
          console.error("Error updating link:", error);
        });
    }
  };

  const handleEditKey = async (oldKey: string) => {
    const newKey = newKeyInput.trim();
    if (oldKey === newKey || !newKey) {
      setEditingKey(null);
      return;
    }
    
    try {
      const snapshot = await get(ref(db, `bg/${oldKey}`));
      const linkData = snapshot.val();
      
      if (linkData) {
        await set(ref(db, `bg/${newKey}`), linkData);
        await remove(ref(db, `bg/${oldKey}`));
        setEditingKey(null);
        setNewKeyInput('');
      } else {
        console.error("No data found for the old key:", oldKey);
        setEditingKey(null);
      }
    } catch (error) {
      console.error("Error editing key:", error);
      setEditingKey(null);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMenuListVisible(true);
    }, 2800);

    const bgRef = ref(db, 'bg');
    const unsubscribe = onValue(bgRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sortedKeys = Object.keys(data).sort();
        const sortedLinks: { [key: string]: string } = {};
        sortedKeys.forEach(key => {
          sortedLinks[key] = data[key];
        });
        setBgLinks(sortedLinks);
      } else {
        setBgLinks({});
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (menuState === MenuState.Gallery) {
      timer = setTimeout(() => {
        setIsGalleryOpen(true);
      }, 1000);
    } else {
      setIsGalleryOpen(false);
    }
    return () => clearTimeout(timer);
  }, [menuState]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (menuState === MenuState.Blog) {
      timer = setTimeout(() => {
        setIsBlogOpen(true);
      }, 1000);
    } else {
      setIsBlogOpen(false);
    }
    return () => clearTimeout(timer);
  }, [menuState]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const half = (value: number) => isMobile ? value / 2 : value;
  const squareStyle = 'absolute border-white/50 w-[150] sm:w-[300px] h-[150px] sm:h-[300px] flex flex-col';

  return (
    <PageLayout
      className='relative overflow-hidden flex items-center justify-center'
      bgLinks={Object.values(bgLinks)}
    >
      <AnimatePresence>
        {auth.currentUser && isEditMode && (menuState === MenuState.Default || menuState === MenuState.Init) && (
          <motion.div
            className="fixed top-10 sm:right-4 bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg shadow-xl z-[1001] border border-gray-700 overflow-x-auto w-[90%] max-w-[600px]"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4 text-white">Edit Background Images</h3>
            <div className="flex gap-2 mb-2 w-full">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="key"
                className="flex-1 p-2 rounded bg-gray-700 text-white placeholder-gray-500"
              />
              <input
                type="text"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="New Image URL"
                className="flex-1 p-2 rounded bg-gray-700 text-white placeholder-gray-500"
              />
              <button
                onClick={handleAddLink}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition"
              >
                Add
              </button>
            </div>

            <ul className="space-y-2 max-h-[400px] overflow-y-auto w-full">
              {Object.entries(bgLinks).map(([key, link]) => (
                <li key={key} className="flex items-center gap-2">
                  <span className="w-1/4 text-sm text-gray-300 truncate">
                    {editingKey === key ? (
                      <input
                        type="text"
                        value={newKeyInput}
                        onChange={(e) => setNewKeyInput(e.target.value)}
                        onBlur={() => handleEditKey(key)}
                        className="bg-gray-700 text-white rounded p-2 w-full"
                        autoFocus
                      />
                    ) : (
                      key
                    )}
                  </span>
                  <input
                    type="text"
                    defaultValue={link}
                    onBlur={(e) => handleEditLink(key, e.target.value)}
                    className="flex-1 p-2 rounded bg-gray-700 text-white"
                  />
                  <button
                    onClick={() => handleRemoveLink(key)}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition"
                  >
                    Remove
                  </button>
                  {editingKey !== key && (
                    <button
                      onClick={() => {
                        setEditingKey(key);
                        setNewKeyInput(key);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
                    >
                      Edit Key
                    </button>
                  )}
                  {editingKey === key && (
                    <button
                      onClick={() => handleEditKey(key)}
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition"
                    >
                      Save
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="absolute top-4 right-4 z-[1000] cursor-default"
        onClick={() => setShowLogin(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.75, duration: 0.5 }}
      >
        &nbsp;
      </motion.button>

      {auth.currentUser &&
        <button className="absolute bottom-4 left-4 hover:underline z-[1000]" onClick={() => setEditMode(!isEditMode)}>
          toggle editor
        </button>
      }

      <AnimatePresence>
        {showLogin && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogin(false)}
          >
            <motion.div
              className="fixed top-20 w-[90%] max-w-[300px] bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg shadow-xl z-[1001] border border-gray-700 text-center flex flex-col gap-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-2">Log In</h2>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 rounded bg-gray-700 text-white placeholder-gray-400"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-2 rounded bg-gray-700 text-white placeholder-gray-400"
              />
              <div className="flex gap-4">
                <button
                  onClick={handleSignIn}
                  className="bg-pink-500 hover:bg-pink-600 transition duration-300 text-white font-bold py-2 px-4 rounded-full flex-1"
                >
                  Sign In
                </button>
                <button
                  onClick={handleSignOut}
                  className="bg-gray-600 hover:bg-gray-700 transition duration-300 text-white font-bold py-2 px-4 rounded-full flex-1"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {message && (
          <motion.div
            className="fixed top-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-[300] max-w-sm text-center"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className={cn(squareStyle, 'items-center border-2 sm:border-4 justify-center text-center z-50')}
        animate={{
          rotateZ: [135, 0, 0],
          translateX:
            menuState === MenuState.Init
              ? [0, half(150), half(-150)]
              : menuState === MenuState.Default
                ? half(-150)
                : menuState === MenuState.Gallery || menuState === MenuState.Blog
                  ? [half(-150), half(150), 0]
                  : 0,
          translateY:
            menuState === MenuState.Init
              ? [0, half(150), half(-150)]
              : menuState === MenuState.Default
                ? half(-150)
                : menuState === MenuState.Gallery || menuState === MenuState.Blog
                  ? [half(-150), half(150), 0]
                  : 0,
          width:
            menuState === MenuState.About || menuState === MenuState.Comms || menuState === MenuState.Misc
              ? half(600)
              : menuState === MenuState.Gallery
                ? isGalleryOpen
                  ? "100%"
                  : [half(300), half(300), half(600)]
                : menuState === MenuState.Blog
                  ? isBlogOpen
                    ? "100%"
                    : [half(300), half(300), half(600)]
                  : half(300),
          height:
            menuState === MenuState.About || menuState === MenuState.Comms || menuState === MenuState.Misc
              ? half(600)
              : menuState === MenuState.Gallery
                ? isGalleryOpen
                  ? "100%"
                  : [half(300), half(300), half(600)]
                : menuState === MenuState.Blog
                  ? isBlogOpen
                    ? "100%"
                    : [half(300), half(300), half(600)]
                  : half(300),
        }}
        transition={{
          delay:
            menuState === MenuState.Init ? 2
              : menuState === MenuState.Default ? 0
              : 0.3,
          duration:
            menuState === MenuState.Init ? 1.5
              : menuState === MenuState.Gallery || menuState === MenuState.Blog ? 0.7
              : 0.3,
          ease: "easeInOut",
          times: [0, 0.5, 1],
        }}
      >
        <AnimatePresence>
          { menuState !== MenuState.Init && menuState !== MenuState.Default && !isBlogItemOpen && (
            <motion.div
              className='absolute top-0 sm:top-4 -left-5 sm:left-6 z-[900]'
              initial={{ opacity: 0, translateX: 50 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: 0, transition: {delay:0} }}
              transition={{
                duration: 0.5,
                delay: menuState !== MenuState.Blog ? 1 : 0.5
              }}
            >
              <BackButton onClick={() => {
                if (!isBlogItemOpen) {
                  setMenuState(MenuState.Default)
                  setMenuListVisible(true)
                }
              }}/>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          { (menuState === MenuState.Init || menuState === MenuState.Default) && (
            <motion.h1
              className={cn(TextStyle.Body, 'absolute p-2 text-[10px] sm:text-base ')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: {delay:0} }}
              transition={{
                delay: menuState === MenuState.Init ? 2.75 : 0,
                duration: 0.5,
                ease: "easeInOut",
              }}
            >
              hihi
              <br />
              im pyxidata
              <br />
              <br />
              <br />
              i might be a
              <br />
              character illustrator
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence>
          { menuState === MenuState.About && (
            <motion.div
              className='w-full h-full p-4 sm:p-8 pt-8 sm:pt-16'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: {delay:0}}}
              transition={{
                delay: 0.5,
                duration: 1,
                ease: "easeInOut",
              }}
            >
              <AboutMe />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          { menuState === MenuState.Comms && (
            <motion.div
              className='w-full h-full p-8'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: {delay:0}}}
              transition={{
                delay: 0.5,
                duration: 1,
                ease: "easeInOut",
              }}
            >
              <Comms />
            </motion.div>
          )}
        </AnimatePresence>

        { menuState === MenuState.Blog && (
          <BlogPage setIsBlogItemOpen={setIsBlogItemOpen}/>
        )}

        { menuState === MenuState.Gallery && (
          <Gallery />
        )}

        <AnimatePresence>
          { menuState === MenuState.Misc && (
            <motion.div
              className='w-full h-full p-8 pt-16'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: {delay:0}}}
              transition={{
                delay: 0.5,
                duration: 1,
                ease: "easeInOut",
              }}
            >
              <Misc />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <MenuList
        onAboutClicked={() => {
          setMenuState(MenuState.About)
          setMenuListVisible(false)
        }}
        onCommsClicked={() => {
          setMenuState(MenuState.Comms)
          setMenuListVisible(false)
        }}
        onBlogClicked={() => {
          setMenuState(MenuState.Blog)
          setMenuListVisible(false)
        }}
        onGalleryClicked={() => {
          setMenuState(MenuState.Gallery)
          setMenuListVisible(false)
        }}
        onMiscClicked={() => {
          setMenuState(MenuState.Misc)
          setMenuListVisible(false)
        }}
        visible={menuListVisible}
        showEditor={() => {
          return menuState === MenuState.Init || menuState === MenuState.Default
        }}
      />
    </PageLayout>
  );
}