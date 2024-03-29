const express = require('express')
const productModel = require('../models/product.model')
const categoryModel = require('../models/category.model')
const router = express.Router()

function check(req, res, next) {
    if(req.isAuthenticated()) return next()
    res.redirect('/user/login')
}

router.get('/', check, async(req, res) => {
    try {
        const products = await productModel.find().populate('category',['name'])
        res.render('products/list', {products: products})
    } catch(e) {
        console.log(e)
        res.redirect('/')
    }
})

// Search product
router.get('/search', async(req, res) => {
    const name_search = req.query.name 
    const price_search = req.query.price

    const products = await productModel.find().populate('category',['name'])
	const result = products.filter((product) => {
		return product.category.name.toLowerCase().indexOf(name_search.toLowerCase()) !== -1 
        && product.price === parseInt(price_search)
    })
    console.log(result)
    res.render('products/search', {products: result});
    
})

// All product
router.get('/allProduct', async(req, res) => {
    try {
        const products = await productModel.find()
        res.render('products/allProduct', {products: products})
    } catch(e) {
        console.log(e)
        res.redirect('/')
    }
})

// Product detail
router.get('/:id', async(req, res) => {
    try {
        const product = await productModel.findById(req.params.id)
        res.render('products/productDetail', {product: product})
    } catch(e) {
        console.log(e)
        res.redirect('/')
    }
})


// Add product
router.get('/add', async(req, res) => {
    const product = new productModel()
    const categories = await categoryModel.find()
    res.render('products/add', {product: product, categories: categories})
})

router.post('/', async(req, res) => {
    try {
        const productNew = new productModel({
            name: req.body.name,
            information: req.body.information,
            quantity: req.body.quantity,
            price: req.body.price,
            category: req.body.category
        })
        if (req.body.image != null && req.body.image != '') {
            const imageEncode = JSON.parse(req.body.image)
            productNew.imageType = imageEncode.type
            productNew.imageData = new Buffer.from(imageEncode.data, 'base64')
        }
        await productNew.save()
        res.redirect('/product')
    } catch(e) {
        console.log(e.message)
        res.redirect('/')
    }
    
    res.send(imageEncode)
})

// Edit product
router.get('/edit/:id', async(req, res) => {
    try {
        const product = await productModel.findById(req.params.id)
        const categories = await categoryModel.find()
        res.render('products/edit', {product: product, categories: categories})
    } catch(e) {
        console.log(e)
        res.redirect('/')
    }
})

router.put('/edit/:id', async(req, res) => {
    try {
        const product = await productModel.findById(req.params.id)
        product.name = req.body.name,
        product.information = req.body.information,
        product.quantity = req.body.quantity,
        product.price = req.body.price,
        product.category = req.body.category
        if (req.body.image != null && req.body.image != '') {
            const imageEncode = JSON.parse(req.body.image)
            product.imageType = imageEncode.type
            product.imageData = new Buffer.from(imageEncode.data, 'base64')
        }
        await product.save()
        res.redirect('/product')
    }
    catch(e) {
        console.log(e)
        res.redirect('/')
    }
})

// Delete product
router.delete('/delete/:id', async(req, res) => {
    try {
        const productDelete = await productModel.findById(req.params.id)
        await productDelete.remove()
        res.redirect('/product')
    }
    catch(e) {
        console.log(e)
        res.redirect('/')
    }
})

module.exports = router