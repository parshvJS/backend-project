class response{
    constructor(statuscode,data=null,message="Success"){
        this.statuscode=statuscode
        this.message=message
        this.data=data
        this.success=statuscode<400
    }
}