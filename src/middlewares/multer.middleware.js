import multer from "multer";

const storage=multer.diskStorage({
    destination:function(res,file,cd){
        cd(null,"./public/temp")
    },
    filename:function(res,file,cb){
        cb(null,file.originalname)
    }
})

export const upload=multer({
    storage
})