import { Link } from "react-router-dom";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import './FeaturedItems.css'

const FeaturedItems = (props) => {
    return (
         
        <div className="featured__products__container">
            <div className="featured__products">
                <div className="featured__products__header">
                    <h3 className='featured__items__header__big'>Featured Items </h3><Link to="/shop" className='featured__header__small'>Show all <ArrowRightAltIcon /></Link>
                </div>
                </div>
            </div>        
     );
}
 
export default FeaturedItems;