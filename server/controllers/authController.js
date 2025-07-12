//login api
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const login = async (req, res) => {
    try{
        const{email,password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"});
        }
        const token = jwt.sign({id: user._id,role: user.role}, process.env.JWT_SECRET, {expiresIn: '1d'});
        return res.status(200).json({
            success:true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message: "Internal server error"});
    }
} 
export {login};