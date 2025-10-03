// Tên file: api/scriptblox-proxy.js

// Khai báo hàm Serverless Function cho môi trường Vercel
module.exports = async (req, res) => {
    
    // URL API GỐC MỚI NHẤT
    const BASE_API_URL = 'https://scriptblox.com/api/script/search?q=';

    // Lấy query string từ frontend
    const { url } = req;
    const query = url.split('?')[1] ? '?' + url.split('?')[1] : '';
    const targetUrl = BASE_API_URL + query; 

    // Thiết lập Header CORS (Giải quyết lỗi CORS)
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    // Xử lý yêu cầu OPTIONS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Gọi API gốc từ Server Vercel
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 
                'Accept': 'application/json',
            }
        });
        
        // Kiểm tra lỗi HTTP từ API gốc
        if (!response.ok) {
            res.status(response.status).json({ 
                error: `Upstream API Failed: ${response.status} ${response.statusText}`, 
                details: "The upstream ScriptBlox API may be down or has rejected the request."
            });
            return;
        }

        // Trả về dữ liệu JSON
        const data = await response.json();
        res.status(200).json(data);
        
    } catch (error) {
        // Xử lý lỗi kết nối
        console.error('Proxy Fetch Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error during API fetch.', details: error.message });
    }
};