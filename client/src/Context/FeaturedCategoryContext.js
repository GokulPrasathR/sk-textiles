import { createContext } from "react";

import menFashion from '../asset/Products/cloth/men/men-1.jpeg'
import kidsFashion from '../asset/Products/cloth/kids/kids-2.jpeg'

export const FeatureCategoryContext = createContext([
    {
        name: "Men's Fashion",
        image: menFashion,
        url: '/category/men',
        id: 1
    },
    {
        name: "Kids Fashion",
        image: kidsFashion,
        url: '/category/kids',
        id: 2
    }
])