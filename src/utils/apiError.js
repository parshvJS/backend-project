class apiError extends Error{
    constructor(statuscode,message="Something went wrong !",errors=[],stack="")
    {
        super(messeage)
        this.statuscode=statuscode
        this.message=message
        this.errors=errors
        this.data=null
        this.success=false
        
        if(stack){
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }

        
    }
}

export {apiError}