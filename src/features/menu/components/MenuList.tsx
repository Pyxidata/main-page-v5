import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../util/cn';
import { TextStyle } from '../../../shared/styles/TextStyle';
import discord from '../../../assets/discord.png';
import email from '../../../assets/email.png';
import instagram from '../../../assets/instagram.png';
import pixiv from '../../../assets/pixiv.png';
import twitter from '../../../assets/twitter.png';
import EditableField from '../../../shared/components/editables/EditableField';
import { getDatabase, onValue, ref } from 'firebase/database';

const db = getDatabase();

// The MenuListItem component now uses props for its positioning, allowing for dynamic values
function MenuListItem({
    className,
    enterDelay = 0,
    exitDelay = 0,
    children,
}: {
    className?: string;
    enterDelay?: number;
    exitDelay?: number;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            className={cn(className)}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        delay: enterDelay,
                        duration: 0.6,
                        ease: 'easeInOut',
                    },
                },
                exit: {
                    opacity: 0,
                    transition: {
                        delay: exitDelay,
                        duration: 0.6,
                        ease: 'easeInOut',
                    },
                },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {children}
        </motion.div>
    );
}

export function MenuList({
    onAboutClicked = () => {},
    onCommsClicked = () => {},
    onBlogClicked = () => {},
    onGalleryClicked = () => {},
    onMiscClicked = () => {},
    visible = true,
}: {
    onAboutClicked?: () => void;
    onCommsClicked?: () => void;
    onBlogClicked?: () => void;
    onGalleryClicked?: () => void;
    onMiscClicked?: () => void;
    visible?: boolean;
}) {
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [socials, setSocials] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 640);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const socialsRef = ref(db, 'socials');
        const unsubscribe = onValue(socialsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setSocials(data);
            } else {
                setSocials({});
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const baseSquareStyle = 'absolute border-white/50 flex flex-col p-1 border-b border-r sm:p-2 sm:border-b-2 sm:border-r-2';

    const linkStyle = cn(TextStyle.Body, 'text-[10px] sm:text-base absolute start-0.5 bottom-0.5 sm:start-2 sm:bottom-2 transition duration-500 hover:blur-sm');
    const iconStyle = cn(TextStyle.Body, 'absolute end-0.5 top-0.5 sm:end-[5px] sm:top-[5px] transition duration-500 hover:blur-sm');

    const translations = isSmallScreen 
        ? {
            about: "w-[150px] h-[150px] -translate-x-[45px] -translate-y-[45px]",
            comms: "w-[150px] h-[150px] -translate-x-[15px] -translate-y-[15px]",
            blog: "w-[150px] h-[150px] translate-x-[15px] translate-y-[15px]",
            gallery: "w-[150px] h-[150px] translate-x-[45px] translate-y-[45px]",
            misc: "w-[150px] h-[150px] translate-x-[75px] translate-y-[75px]",
        }
        : {
            about: "w-[300px] h-[300px] -translate-x-[90px] -translate-y-[90px]",
            comms: "w-[300px] h-[300px] -translate-x-[30px] -translate-y-[30px]",
            blog: "w-[300px] h-[300px] translate-x-[30px] translate-y-[30px]",
            gallery: "w-[300px] h-[300px] translate-x-[90px] translate-y-[90px]",
            misc: "w-[300px] h-[300px] translate-x-[150px] translate-y-[150px]",
        };

    return (
        <AnimatePresence>
            {visible && (
                <div className="flex items-center justify-center">
                    <MenuListItem
                        className={cn(baseSquareStyle, translations.about, "z-40")}
                        enterDelay={0.2}
                        exitDelay={0}
                    >
                        <button className={linkStyle} onClick={onAboutClicked}>
                            know about me
                        </button>
                        <a href={socials.twitter} className={iconStyle} target="_blank" rel="noopener noreferrer">
                            <img src={twitter} className="w-12 px-2" />
                        </a>
                    </MenuListItem>

                    <MenuListItem
                        className={cn(baseSquareStyle, translations.comms, "z-30")}
                        enterDelay={0.15}
                        exitDelay={0.05}
                    >
                        <button className={linkStyle} onClick={onCommsClicked}>
                            commissions
                        </button>
                        <a href={socials.pixiv} className={iconStyle} target="_blank" rel="noopener noreferrer">
                            <img src={pixiv} className="w-12 px-2" />
                        </a>
                    </MenuListItem>

                    <MenuListItem
                        className={cn(baseSquareStyle, translations.blog, "z-20")}
                        enterDelay={0.1}
                        exitDelay={0.1}
                    >
                        <button className={linkStyle} onClick={onBlogClicked}>
                            humble blog
                        </button>
                        <a href={socials.instagram} className={iconStyle} target="_blank" rel="noopener noreferrer">
                            <img src={instagram} className="w-12 px-2" />
                        </a>
                    </MenuListItem>

                    <MenuListItem
                        className={cn(baseSquareStyle, translations.gallery, "z-10")}
                        enterDelay={0.05}
                        exitDelay={0.15}
                    >
                        <button className={linkStyle} onClick={onGalleryClicked}>
                            art gallery
                        </button>
                        <a href={socials.discord} className={iconStyle} target="_blank" rel="noopener noreferrer">
                            <img src={discord} className="w-12 px-2" />
                        </a>
                    </MenuListItem>

                    <MenuListItem
                        className={cn(baseSquareStyle, translations.misc, "z-0")}
                        enterDelay={0}
                        exitDelay={0.2}
                    >
                        <button className={linkStyle} onClick={onMiscClicked}>
                            neat stuff
                        </button>
                        <a href={`mailto:${socials.email}`} className={iconStyle} target="_blank" rel="noopener noreferrer">
                            <img src={email} className="w-12 px-1.5" />
                        </a>
                    </MenuListItem>
                </div>
            )}
            <div className='flex flex-col w-64 absolute bottom-4 end-4'>
                <EditableField
                    defaultValue={socials.twitter}
                    path={`socials`}
                    field="twitter"
                    label="twitter"
                />
                <EditableField
                    defaultValue={socials.pixiv}
                    path={`socials`}
                    field="pixiv"
                    label="pixiv"
                />
                <EditableField
                    defaultValue={socials.instagram}
                    path={`socials`}
                    field="instagram"
                    label="instagram"
                />
                <EditableField
                    defaultValue={socials.discord}
                    path={`socials`}
                    field="discord"
                    label="discord"
                />
                <EditableField
                    defaultValue={socials.email}
                    path={`socials`}
                    field="email"
                    label="email"
                />
            </div>
        </AnimatePresence>
    );
}