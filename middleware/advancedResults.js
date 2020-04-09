//Pagination, filters, select, sort
const advancedResults = (model, populate) => async (req, res, next) => {
    let query

    //copy query
    const reqQuery = { ...req.query }

    //fields to exclude
    const removeFiels = ['select', 'sort', 'page', 'limit']

    //loop over remove fields and delete them from requestQuery
    removeFiels.forEach(param => delete reqQuery[param])
    
    //create query string
    let queryStr = JSON.stringify(reqQuery)
    
    //create query string by params + use 
    //gt = greater than; lt = lower than; e = equal; in = in array ex: careers[in]=Business
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
    
    //find resource
    query = model.find(JSON.parse(queryStr))//.populate('courses') //if specific courses, look into controllers/courses.js => getCourses => populate method

    //select fields
    if(req.query.select) {
        const fields = req.query.select.replace(/,/g, " ")
        console.log(fields);
        query = query.select(fields)
    }

    //sort
    if(req.query.sort) {
        const sortBy = req.query.sort.replace(/,/g, " ") //specific synthax
        query = query.sort(sortBy)
    } else {
        query = query.sort('-createdAt')
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 25
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await model.countDocuments()

    query.skip(startIndex).limit(limit)

    if(populate) {
        query = query.populate(populate)
    }

    //get result
    const results = await query

    //Pagination result
    const pagination = {}
    if(endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0) {
        pagination.prev = {
            page: page -1,
            limit
        }
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next()
}

module.exports = advancedResults