import { useEffect, useState } from 'react';
import { TabTitle } from '../../utils/General';
import axios from "axios";
import ShopCategory from './Container/ShopCategory';
import './Shop.css';


const Shop = () => {
    TabTitle("Shop - SK")
    const [ menItems, setMenItems ] = useState()
    const [ kidsItems, setKidsItems ] = useState()

    useEffect(() => {
        axios.get("https://shema-backend.vercel.app/api/items")
            .then(res => {
                setMenItems(res.data.filter((item) => item.category === "men"))
                setKidsItems(res.data.filter((item) => item.category === "kids" ))
            })
            .catch(err => console.log(err))
        window.scrollTo(0, 0)
    
    }, [])

    return ( 
        <div className="shop__contianer">
            
            {menItems && <ShopCategory name="Men" key="men" items={menItems}/>}
            {kidsItems && <ShopCategory name="Kids" key="kids" items={kidsItems}/>}
        </div>
     );
}
 
export default Shop;