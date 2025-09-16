import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { TextStyle } from "../../styles/TextStyle";
import { cn } from "../../../util/cn";

const shuffleArray = (array: number[]): number[] => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
};

interface CharState {
    originalChar: string;
    displayChar: string;
    isRevealed: boolean;
    isWhitespace: boolean;
    index: number;
    isWordCharacter: boolean;
}

interface TextProps {
    text: string;
    className?: string;
    style?: React.CSSProperties;
    animate?: boolean;
    animationDuration?: number;
    animationDelay?: number;
    animationCharSet?: string;
}

export default function Text({
    text,
    className = TextStyle.Body,
    style = {},
    animate = false,
    animationDuration = 2000,
    animationDelay = 0,
    animationCharSet = "!@#$%^&*_+|-=\\`~123456788990<>{}[]()/?;:'\"",
}: TextProps) {
    const [charStates, setCharStates] = useState<CharState[]>([]);
    const [isAnimationComplete, setIsAnimationComplete] = useState(false);
    const animationFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const shuffledIndicesRef = useRef<number[]>([]);

    const initialCharStates = useMemo(() => {
        return text.split('').map((char, index) => ({
            originalChar: char,
            displayChar: char,
            isRevealed: false,
            isWhitespace: char === " " || char === '\n' || char === '\t',
            index: index,
            isWordCharacter: !/\s/.test(char),
        }));
    }, [text]);

    const generateGibberishChar = useCallback(() => {
        return animationCharSet[Math.floor(Math.random() * animationCharSet.length)];
    }, [animationCharSet]);

    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!animate || !text) {
            setCharStates(initialCharStates.map(char => ({
                ...char,
                displayChar: char.originalChar,
                isRevealed: true,
            })));
            setIsAnimationComplete(true);
            return;
        }

        setIsAnimationComplete(false);
        const initialSetup = initialCharStates.map(char => ({
            ...char,
            displayChar: char.isWhitespace ? char.originalChar : generateGibberishChar(),
            isRevealed: char.isWhitespace,
        }));
        setCharStates(initialSetup);

        const activeCharIndices = initialSetup
            .filter(char => char.isWordCharacter)
            .map(char => char.index);

        shuffledIndicesRef.current = shuffleArray([...activeCharIndices]);

        startTimeRef.current = null;

        const animateChars = (currentTime: DOMHighResTimeStamp) => {
            if (!startTimeRef.current) {
                startTimeRef.current = currentTime;
            }

            const elapsed = currentTime - startTimeRef.current;
            const progress = elapsed / animationDuration;

            setCharStates((prevCharStates) => {
                const newCharStates = [...prevCharStates];

                const charsToRevealCount = Math.floor(shuffledIndicesRef.current.length * progress);

                shuffledIndicesRef.current.forEach((originalIndex, i) => {
                    const char = initialCharStates[originalIndex];
                    if (char.isWhitespace) {
                        newCharStates[originalIndex] = { ...char, displayChar: char.originalChar, isRevealed: true };
                    } else if (i < charsToRevealCount) {
                        newCharStates[originalIndex] = { ...char, displayChar: char.originalChar, isRevealed: true };
                    } else {
                        if (Math.random() > 0.7) {
                            newCharStates[originalIndex] = { ...char, displayChar: generateGibberishChar(), isRevealed: false };
                        } else {
                            newCharStates[originalIndex] = { ...char, displayChar: prevCharStates[originalIndex]?.displayChar || generateGibberishChar(), isRevealed: false };
                        }
                    }
                });
                return newCharStates;
            });


            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animateChars);
            } else {
                setCharStates(initialCharStates.map(char => ({
                    ...char,
                    displayChar: char.originalChar,
                    isRevealed: true,
                })));
                setIsAnimationComplete(true);
                animationFrameRef.current = null;
            }
        };

        const startAnimation = () => {
            animationFrameRef.current = requestAnimationFrame(animateChars);
        };

        if (animationDelay > 0) {
            timeoutRef.current = setTimeout(startAnimation, animationDelay);
        } else {
            startAnimation();
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [text, animate, animationDelay, animationDuration, generateGibberishChar, initialCharStates]);

    const renderAnimatedContent = useCallback(() => {
        const words: React.ReactNode[] = [];
        let currentWordChars: CharState[] = [];
        let isNewLine = true;

        const charWidthStyle = { display: 'inline-block' };

        charStates.forEach((char) => {
            if (char.originalChar === '\n') {
                if (currentWordChars.length > 0) {
                    words.push(
                        <span key={`word-${words.length}`} style={{ display: 'inline-block' }}>
                            {currentWordChars.map((wc) => (
                                <span key={`char-${wc.index}`} style={charWidthStyle}>
                                    {wc.displayChar}
                                </span>
                            ))}
                        </span>
                    );
                    currentWordChars = [];
                }
                words.push(<br key={`char-br-${char.index}`} />);
                isNewLine = true;
            } else if (char.originalChar === ' ') {
                if (isNewLine) {
                    isNewLine = false;
                } else {
                    if (currentWordChars.length > 0) {
                        words.push(
                            <span key={`word-${words.length}`} style={{ display: 'inline-block' }}>
                                {currentWordChars.map((wc) => (
                                    <span key={`char-${wc.index}`} style={charWidthStyle}>
                                        {wc.displayChar}
                                    </span>
                                ))}
                            </span>
                        );
                        currentWordChars = [];
                    }
                    words.push(<span key={`char-${char.index}`} style={charWidthStyle}>&nbsp;</span>);
                }
                isNewLine = false;
            } else if (char.originalChar === '\t') {
                if (currentWordChars.length > 0) {
                    words.push(
                        <span key={`word-${words.length}`} style={{ display: 'inline-block' }}>
                            {currentWordChars.map((wc) => (
                                <span key={`char-${wc.index}`} style={charWidthStyle}>
                                    {wc.displayChar}
                                </span>
                            ))}
                        </span>
                    );
                    currentWordChars = [];
                }
                words.push(<span key={`char-${char.index}`} style={charWidthStyle}>{char.displayChar}</span>);
                isNewLine = false;
            } else {
                currentWordChars.push(char);
                isNewLine = false;
            }
        });

        if (currentWordChars.length > 0) {
            words.push(
                <span key={`word-final`} style={{ display: 'inline-block' }}>
                    {currentWordChars.map((wc) => (
                        <span key={`char-${wc.index}`} style={charWidthStyle}>
                            {wc.displayChar}
                        </span>
                    ))}
                </span>
            );
        }

        return words;
    }, [charStates]);


    return (
        <p className={cn(className)} style={style}>
            {isAnimationComplete ? text : renderAnimatedContent()}
        </p>
    );
}