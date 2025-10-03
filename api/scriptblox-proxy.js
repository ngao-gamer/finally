// Tên file: api/scriptblox-proxy.js

module.exports = async (req, res) => {
    
    const BASE_API_URL = 'https://scriptblox.com/api/script/search';

    const { url } = req;
    
    // Xử lý tham số tìm kiếm
    let queryParams = new URLSearchParams(url.split('?')[1] || '');

    // ĐẢM BẢO LUÔN CÓ THAM SỐ 'q' (QUERY) VỚI GIÁ TRỊ RỖNG
    if (!queryParams.has('q')) {
        queryParams.set('q', '');
    }

    const targetUrl = BASE_API_URL + '?' + queryParams.toString(); 

    // Thiết lập Header CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // GỌI API GỐC VỚI HEADER MẠNH MẼ
        const response = await fetch(targetUrl, {
            headers: {
                'Host': 'scriptblox.com', 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*', 
                'Referer': 'https://scriptblox.com/', 
                'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8', 
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty', 
                'Sec-Fetch-Mode': 'cors',
            }
        });
        
        // Kiểm tra lỗi HTTP từ API gốc
        if (!response.ok) {
            let errorBodyText = await response.text();
            
            res.status(500).json({ 
                error: `Upstream API Failed: ${response.status} ${response.statusText}`, 
                details: "API gốc đã từ chối yêu cầu. Có thể API đang bảo trì hoặc đã đổi cơ chế bảo mật.",
                upstream_response_snippet: errorBodyText.substring(0, 200) + '...' 
            });
            return;
        }

        // Trả về dữ liệu JSON thành công
        const data = await response.json();
        res.status(200).json(data);
        
    } catch (error) {
        console.error('Proxy Fetch Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error during API fetch.', details: error.message });
    }
};