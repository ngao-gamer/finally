// Tên file: api/scriptblox-proxy.js

module.exports = async (req, res) => {
    
    // URL API GỐC MỚI NHẤT của bạn (đã xác nhận)
    const BASE_API_URL = 'https://scriptblox.com/api/script/search';

    const { url } = req;
    const query = url.split('?')[1] ? '?' + url.split('?')[1] : '';
    const targetUrl = BASE_API_URL + query; 

    // Thiết lập Header CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // GỌI API GỐC VỚI HEADER ĐƯỢC TĂNG CƯỜNG ĐỂ TRÁNH BỊ CHẶN
        const response = await fetch(targetUrl, {
            headers: {
                // Giả lập User-Agent của một trình duyệt Chrome hiện đại
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                // Chỉ ra rằng chúng ta chấp nhận JSON, Text và bất kỳ loại nội dung nào
                'Accept': 'application/json, text/plain, */*', 
                // Bắt chước việc request đến từ trang chủ ScriptBlox
                'Referer': 'https://scriptblox.com/', 
                // Thêm các header chuẩn của trình duyệt
                'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8', 
                'Connection': 'keep-alive',
            }
        });
        
        // Kiểm tra lỗi HTTP từ API gốc. Nếu là 403/500/etc.
        if (!response.ok) {
            // Cố gắng lấy body lỗi từ API gốc (nếu có)
            let errorBodyText = await response.text();
            
            // Trả về lỗi chi tiết
            res.status(500).json({ 
                error: `Upstream API Failed: ${response.status} ${response.statusText}`, 
                details: "API gốc đã từ chối yêu cầu. Đã thử dùng Header nâng cao.",
                // Thêm 1 phần nhỏ body lỗi để debug (giới hạn 200 ký tự)
                upstream_response_snippet: errorBodyText.substring(0, 200) + '...' 
            });
            return;
        }

        // Trả về dữ liệu JSON thành công
        const data = await response.json();
        res.status(200).json(data);
        
    } catch (error) {
        // Xử lý lỗi mạng hoặc lỗi Serverless Function nội bộ
        console.error('Proxy Fetch Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error during API fetch.', details: error.message });
    }
};