import { createContext, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
 
export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {

    const currency = import.meta.env.VITE_CURRENCY;

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([])

    const [cartItems, setCartItems] = useState({})
    const [searchQuery, setSearchQuery] = useState({})

   // Fetch Seller Status
   const fetchSeller = async () =>{
    try {
        const {data} = await axios.get('/api/seller/is-auth');
        if(data.success){
            setIsSeller(true)
        }else {
            setIsSeller(false)
        }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
        setIsSeller(false)
    }
   }

   // Fetch User Auth Status , User Data and Cart Items
   const fetchUser = async ()=> {
    try {
        const {data} = await axios.get('/api/user/is-auth');
        if (data.success){
            setUser(data.user)
            setCartItems(data.user.cartItems || {})
        } else {
            setUser(null)
            setCartItems({})
        }
        
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
        setUser(null)
        setCartItems({})
    }
   }

    //Fetch All Products
    const fetchProducts = async ()=>{
        try {
            const { data } = await axios.get('/api/product/list')
            if(data.success){
                setProducts(data.products)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            
        }
    }

    //ADD Product to Cart
    const addToCart = (itemId)=>{
        let cartData = structuredClone(cartItems);

        if(cartData[itemId]){
            cartData[itemId] += 1;
        }else{
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        toast.success("Added To Cart")
    }

    //Update cart Item Quantity
    const updateCartItem = (itemId, quantity)=>{
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity;
        setCartItems(cartData)
        toast.success("Cart Updated")
    }

    //Remove Product from Cart
    const removeFromCart = (itemId)=>{
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId] -= 1;
            if(cartData[itemId]=== 0){
                delete cartData[itemId];
            }
            toast.success("Remove from cart")
            setCartItems(cartData)
        }
    }

    // Get Cart Item Count

    const getCartCount = ()=>{
        let totalCount = 0;
        for(const item in cartItems){
            totalCount += cartItems[item]

        }
        return totalCount;
    }

    // Get Cart Total Amount

    const getCartAmount = () =>{
        let totalCount = 0;
        for (const items in cartItems){
            let itemInfo = products.find((product)=> product._id === items);
            if(itemInfo){
                totalCount += itemInfo.offerPrice * cartItems[items]
            }
        }
        return Math.floor(totalCount * 100) / 100;
    }



    useEffect(()=>{
        fetchUser()
        fetchSeller()
        fetchProducts()
    },[])

//Update Database Cart Items
    useEffect(()=>{
        const updateCart = async ()=>{
            try {
                const { data } = await axios.post('/api/cart/update', {cartItems})
                if(!data.success){
                    toast.error(data.message)
                }

            } catch (error) {
                toast.error(error.message)
                
            }
        }
          if(user){ 
                 updateCart()
                }
                
    },[cartItems])

    const value = {
        navigate,
        user,
        setUser,
        isSeller,
        setIsSeller,
        showUserLogin,
        setShowUserLogin,
        products,
        currency,
        addToCart,
        updateCartItem,
        removeFromCart,
        cartItems,
        searchQuery,
        setSearchQuery,
        getCartCount,
        getCartAmount,
        axios,
        fetchProducts,
        setCartItems
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => {
    return useContext(AppContext);
}
