// DOM 요소들
const loadMoviesBtn = document.getElementById("loadMoviesBtn");
const movieListItems = document.getElementById("movieListItems");
const cartItems = document.getElementById("cartItems");
const totalPriceElement = document.getElementById("totalPrice");
const userName = document.getElementById("userName");
const userAge = document.getElementById("userAge");
const userAddress = document.getElementById("userAddress");
const userEmail = document.getElementById("userEmail");

const cartContainer = document.getElementById("cartContainer");
const openCartBtn = document.getElementById("openCartBtn");

// X 닫기 버튼
const closeCartBtn = document.createElement("button");
closeCartBtn.classList.add("cart-close-btn");
closeCartBtn.textContent = "X";
cartContainer.appendChild(closeCartBtn);

// 크기 조정 핸들 추가
const resizeHandles = ['tl', 'tr', 'bl', 'br'].map(position => {
    const handle = document.createElement("div");
    handle.classList.add("cart-resize-handle", `cart-resize-${position}`);
    cartContainer.appendChild(handle);
    return handle;
});

let cart = [];

// 로그인된 사용자 정보를 로드하는 함수
const loadLoginUser = async () => {
    try {
        const response = await fetch("./loginUser.json");
        const userData = await response.json();
        console.log("로그인 사용자 정보:", userData);

        userName.textContent = `이름: ${userData.name}`;
        userAge.textContent = `나이: ${userData.age}`;
        userAddress.textContent = `주소: ${userData.address}`;
        userEmail.textContent = `이메일: ${userData.email}`;
    } catch (error) {
        console.error("로그인 사용자 정보를 불러오는 데 실패했습니다:", error);
    }
};

// 영화 목록을 불러오는 함수
const loadMovies = async () => {
    try {
        const response = await fetch("./sujungMovies.json");
        const data = await response.json();

        movieListItems.innerHTML = '';
        data.movies.forEach(movie => {
            const movieItem = document.createElement("li");
            movieItem.classList.add("movie-item");
            movieItem.innerHTML = `
                <img src="${movie["img[src]"]}" alt="${movie.title}" />
                <h3>${movie.title}</h3>
                <p>가격: ${movie.price}원</p>
                <label for="quantity-${movie.num}">수량:</label>
                <input type="number" id="quantity-${movie.num}" min="1" value="1">
                <button class="btn addToCartBtn" data-movie="${movie.num}">장바구니에 담기</button>
            `;
            movieListItems.appendChild(movieItem);
        });

        // '장바구니에 담기' 버튼 이벤트 리스너
        const addToCartBtns = document.querySelectorAll(".addToCartBtn");
        addToCartBtns.forEach(button => {
            button.addEventListener("click", addToCart);
        });
    } catch (error) {
        console.error("영화 목록을 불러오는 데 실패했습니다:", error);
    }
};

// 장바구니에 추가하는 함수
const addToCart = (event) => {
    const movieId = event.target.getAttribute("data-movie");
    const quantity = document.getElementById(`quantity-${movieId}`).value;

    const movie = {
        num: movieId,
        title: event.target.closest(".movie-item").querySelector("h3").textContent,
        price: parseInt(event.target.closest(".movie-item").querySelector("p").textContent.replace("가격: ", "").replace("원", "")),
        cnt: parseInt(quantity),
        total: parseInt(quantity) * parseInt(event.target.closest(".movie-item").querySelector("p").textContent.replace("가격: ", "").replace("원", ""))
    };

    cart.push(movie);
    renderCart();
};

// 장바구니 렌더링
const renderCart = () => {
    cartItems.innerHTML = '';
    let totalPrice = 0;

    cart.forEach(item => {
        totalPrice += item.total;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.title}</td>
            <td>${item.cnt}</td>
            <td>${item.price}원</td>
            <td>${item.total}원</td>
            <td><button class="btn deleteBtn" onclick="removeFromCart(event,'${item.num}');">삭제</button></td>
        `;
        cartItems.appendChild(row);
    });

    totalPriceElement.textContent = `${totalPrice}원`;

};

// 장바구니에서 삭제
const removeFromCart = (event,movieId) => {
    console.log(movieId);
    cart = cart.filter(item => item.num !== (movieId));
    console.log(cart);
    
    renderCart(); // 장바구니 업데이트
};

// 장바구니 열기
const openCart = () => {
    cartContainer.style.display = "block";
    openCartBtn.style.display = "none";
    closeCartBtn.style.display = "inline-block"; // X 버튼 보이기
};

// 장바구니 닫기
const closeCart = () => {
    cartContainer.style.display = "none";
    openCartBtn.style.display = "inline-block";
    closeCartBtn.style.display = "none"; // X 버튼 숨기기
};

// X 버튼 클릭 시 장바구니 닫기
closeCartBtn.addEventListener("click", closeCart);

// 이벤트 리스너 설정
loadMoviesBtn.addEventListener("click", loadMovies);
openCartBtn.addEventListener("click", openCart);

// 페이지 로드 시 로그인된 사용자 정보 불러오기
loadLoginUser();

// 드래그 기능을 위한 변수들
let isDragging = false;
let offsetX, offsetY;

// 마우스 버튼을 눌렀을 때 시작
cartContainer.addEventListener('mousedown', (e) => {
    if (!isResizing) {  // 크기 조정 중이 아니면 이동 시작
        isDragging = true;
        offsetX = e.clientX - cartContainer.getBoundingClientRect().left;
        offsetY = e.clientY - cartContainer.getBoundingClientRect().top;

        // 커서 모양을 'grabbing'으로 변경
        cartContainer.style.cursor = 'grabbing';
    }
});

// 마우스를 움직일 때
document.addEventListener('mousemove', (e) => {
    if (isDragging && !isResizing) {  // 크기 조정 중이 아닐 때만 이동
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        cartContainer.style.left = `${x}px`;
        cartContainer.style.top = `${y}px`;
    }
});

// 마우스를 뗄 때 드래그 종료
document.addEventListener('mouseup', () => {
    isDragging = false;

    // 커서 모양을 'move'로 변경
    cartContainer.style.cursor = 'move';
});

// 크기 조정 기능을 위한 변수들
let isResizing = false;
let startX, startY, startWidth, startHeight;

// 크기 조정을 시작할 때
resizeHandles.forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = cartContainer.offsetWidth;
        startHeight = cartContainer.offsetHeight;

        // 커서 모양을 'se-resize'로 변경
        cartContainer.style.cursor = 'se-resize';
    });
});

// 마우스를 움직일 때 크기 조정
document.addEventListener('mousemove', (e) => {
    if (isResizing) {
        const newWidth = startWidth + (e.clientX - startX);
        const newHeight = startHeight + (e.clientY - startY);

        // 최소 크기를 설정하여 너무 작아지지 않게 제한
        if (newWidth > 150 && newHeight > 150) {
            cartContainer.style.width = `${newWidth}px`;
            cartContainer.style.height = `${newHeight}px`;
        }
    }
});

// 크기 조정을 종료할 때
document.addEventListener('mouseup', () => {
    isResizing = false;
    cartContainer.style.cursor = 'move';
});