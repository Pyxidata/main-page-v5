export type User = {
    name: string;
    desc?: string;
    longDesc?: string;
    bg?: string;
    pfp?: string;
    theme: {
        bg: string;
        surface: string;
        primary: string;
        secondary: string;
        highlight: string;
        font: string;
        width: string;
    };
    oc: {
        [id: string]: {
            sortingTag: string;
            name: string;
            desc?: string;
            longDesc?: string;
            isSona?: boolean;
            links: {
                [id: string]: {
                    sortingTag: string;
                    label: string;
                    url: string;
                }
            }
            pfp?: string;
            ref?: string;
            gallery: {
                [id: string]: {
                    sortingTag: string;
                    credit: string;
                    desc: string;
                    img: string;
                }
            }
        };
    };
  }