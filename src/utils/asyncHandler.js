const asyncHandler=(accseFunction)=>{
    return (req,res,next)=>{
        Promise.resolve(accseFunction(req,res,next)).catch((err)=>next(err))
    }
}

// const asyncHandler=(fn)=>async(req,res,next)=>{
//     try {
//        await fn()
//     } catch (error) {
//         res.status(error.code || 500 ).json({
//             success:false,
//             message:error.message
//         })
//     }
// }
export {asyncHandler}