const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function getDb() {
    if (cachedClient) return cachedClient.db('payelfood');
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
    return client.db('payelfood');
}

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const db = await getDb();
        const collection = db.collection('products');

        // GET - Fetch all products (or filter by category)
        if (req.method === 'GET') {
            const { category } = req.query;
            let filter = {};
            if (category && category !== 'all') {
                filter.category = { $regex: new RegExp(category, 'i') };
            }
            const products = await collection.find(filter).sort({ _id: -1 }).toArray();
            return res.status(200).json({ success: true, products });
        }

        // POST - Add new product
        if (req.method === 'POST') {
            const product = req.body;
            product.createdAt = new Date();
            const result = await collection.insertOne(product);
            return res.status(201).json({ success: true, id: result.insertedId, message: 'Product added!' });
        }

        // PUT - Update product
        if (req.method === 'PUT') {
            const { id, ...updateData } = req.body;
            if (!id) return res.status(400).json({ success: false, message: 'Product ID required' });
            updateData.updatedAt = new Date();
            await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
            return res.status(200).json({ success: true, message: 'Product updated!' });
        }

        // DELETE - Delete product
        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ success: false, message: 'Product ID required' });
            await collection.deleteOne({ _id: new ObjectId(id) });
            return res.status(200).json({ success: true, message: 'Product deleted!' });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
