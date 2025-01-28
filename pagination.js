function pagination(req,res){
    const total_data = req.result
    let {page} = req.query
    const limit = 5
    page  = +page
    const curr_page_result = total_data.slice((page-1)*limit,page*limit)
    const diff = Math.ceil(total_data.length/limit) - page
    return res.status(200).json({
        currPage : page,
        curr_page_result,
        diff,
        lastPage : Math.ceil(total_data.length/limit)
    })
}
module.exports = pagination