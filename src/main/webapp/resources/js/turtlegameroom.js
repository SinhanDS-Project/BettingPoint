let socket;

// 게임방 웹소켓 연결
function connectGameWebSocket(roomId) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close(); // 기존 소켓이 있으면 닫고 새로 연결
    }

    const token = localStorage.getItem("accessToken");
    if(!token) {
        alert("로그인이 필요합니다.");
        return;
    }

    socket = new WebSocket(`ws://${location.host}/ws/game/turtleroom/${roomId}?token=${encodeURIComponent(token)}`);

    socket.onopen = () => {};

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
            case "enter":
            case "exit":
                updatePlayerList(msg.players);
                showSystemMessage(`${msg.userId} 님이 ${msg.type === 'enter' ? '입장' : '퇴장'}했습니다.`);
                break;
            case "update":
                updatePlayerList(msg.players);
                break;
            case "start":
                const targetUrl = msg.target;
                window.location.href = targetUrl;
                break;
            default:
                break;
        }
    };

    socket.onclose = () => {};

    socket.onerror = (error) => {
        console.error("웹소켓 에러", error);
    };

    function showSystemMessage(message) {
        $("#chat-box").append(`<div class="system-message">${message}</div>`);
    }
}

let minBet = 0;

// 게임방 상세 정보 요청
function gameRoomDetail (roomId) {
    let roomPlayers = [];

    // 게임방 상세 정보 요청
    $.ajax({
        url: `/api/gameroom/detail/${roomId}`,
        method: "GET",
        success: function (room) {
            minBet = room.min_bet;

            connectGameWebSocket(roomId);
            players(room, roomPlayers).done(function() {
                renderGameRoomDetail(room, roomPlayers);
            });
        }
    });
};

// 거북이 선택, 포인트 베팅, 준비 상태 변경
function bindGameEvents() {
    let isReady = false;

    $(document).on('change', 'input[name="turtle"]', function() {
        const turtleId = $(this).val();
        socket.send(JSON.stringify({
            type: "choice",
            turtle_id: turtleId
        }));
    });

    $(document).on('click', '#bet-btn', function() {
        const point = $('#bet-point').val();
        if (!point || point <= 0) {
            alert('베팅 포인트를 입력하세요.');
            return;
        }

        if(point < minBet) {
            alert(`최소 베팅은 ${minBet} 포인트 입니다.`);
            return;
        }

        socket.send(JSON.stringify({
            type: "betting",
            betting_point: parseInt(point)
        }));
    });

    $(document).on('click', '#ready-btn', function() {
        const point = $('#bet-point').val();
        if(point <= 0) {
            alert("포인트를 베팅해주세요.");
            return;
        }

        isReady = !isReady; // 전역 변수로 선언 필요
        const $btn = $(this);
        $btn.text(isReady ? '준비 취소' : '게임 준비');

        // 준비 상태일 때 선택 및 입력 비활성화
        $('input[name="turtle"]').prop('disabled', isReady);
        $('#bet-point').prop('disabled', isReady);
        $('#bet-btn').prop('disabled', isReady);

        socket.send(JSON.stringify({
            type: "ready",
            isReady: isReady
        }));
    });
}

let playerCount = 0;

// 플레이어 목록 갱신
function updatePlayerList(players) {
    const $playerList = $("#player-list");
    $playerList.empty(); // 기존 플레이어 목록 초기화

    let isAllReady = true;
    playerCount = players.length;

    players.forEach(player => {
        const html = `
            <div class="player-info" id="player-${player.user_uid}">
                <span><strong>ID:</strong> ${player.user_uid}</span>
                <span><strong>선택한 거북이:</strong> ${player.turtle_id}</span>
                <span><strong>베팅 금액:</strong> ${player.betting_point}</span>
                <span><strong>준비 상태:</strong> ${player.ready ? "준비 완료" : "준비"}</span>
            </div>
        `;
        $playerList.append(html);

        if(!player.ready) {
            isAllReady = false;
        }
    });

    // 게임 시작 버튼 활성화/비활성화
    if (isAllReady) {
        $("#start-game-btn").prop("disabled", false); // 모든 플레이어가 준비되면 버튼 활성화
    } else {
        $("#start-game-btn").prop("disabled", true); // 준비되지 않으면 버튼 비활성화
    }
}

// 게임방 상세 정보 렌더링(임시)
function renderGameRoomDetail(room, roomPlayers) {
    const container = $("#room-detail-container");
    container.empty();

    const roomHtml = `
        <h2 id="room-title">${room.title}</h2>
        <div>
            <p><strong>게임 이름:</strong> ${room.game_name}</p>
            <p><strong>게임 레벨:</strong> ${room.level}</p>
        </div>
        <div id="player-list"></div>
    `;

    container.html(roomHtml);

    updatePlayerList(roomPlayers);
  
    userInfo(function(userId) {
        if(room.host_uid === userId) {
            $("#start-game-btn").show();
        } else {
            $("#start-game-btn").hide();
        }
    });
}

// 플레이어 정보 요청
function players(room, roomPlayers) {
    return $.ajax({
        url: `/api/player/detail/${room.uid}`,
        method: "GET",
        success: function (players) {
            roomPlayers.push(...players);
        }
    });
}

// userId 요청
let userId;

function userInfo(callback) {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        alert("로그인이 필요합니다.");
        return;
    }

    $.ajax({
        url: '/api/user/me',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(user) {
            userId = user.uid;
            callback(userId);
        }
    });
}