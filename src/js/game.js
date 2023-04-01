"use strict"
const socket = io();

  const nickname = document.querySelector("#nickname");
  const scoreList = document.querySelector(".score-list");
  const $timer = document.querySelector('#timer');
  const $score = document.querySelector('#score');
  const $game = document.querySelector('#game');
  const $life = document.querySelector('#life');
  const $start = document.querySelector('#start');
  const $$cells = document.querySelectorAll('.cell');
  const displayContainer = document.querySelector(".display-container")

  const holes = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  let started = false;
  let score = 0;
  let time = 30;
  let life = 3;
  let timerId;
  let tickId;

  $timer.textContent = time;
  $start.addEventListener('click', () => {
    if (started) return; // 이미 시작했으면 무시
    started = true;
    timerId = setInterval(() => {
      time = (time * 10 - 1) / 10;
      $timer.textContent = time;
      if (time === 0) {
        clearInterval(timerId);
        clearInterval(tickId);
        setTimeout(() => {
          alert(`게임 오버! 점수는 ${score}점입니다`);
        }, 50);
        const param = {
          name: nickname.value,
          score: score
        }
        //게임이 끝나면 서버로 유저와 점수 정보 전송
        socket.emit("score",param);
      }
    }, 100);
    tickId = setInterval(tick, 1000);
    tick();
  });

  //두더지와 폭탄 확률 설정
  let gopherPercent = 0.3;
  let bombPercent = 0.5;

  function tick() {
    holes.forEach((hole, index) => {
      if (hole) return; // 무언가 일어나고 있으면 return
      const randomValue = Math.random();
      if (randomValue < gopherPercent) {
        const $gopher = $$cells[index].querySelector('.gopher');
        holes[index] = setTimeout(() => { // 1초 뒤에 사라짐
          $gopher.classList.add('hidden');
          holes[index] = 0;
        }, 1000); 
        $gopher.classList.remove('hidden');
      } else if (randomValue < bombPercent) {
        const $bomb = $$cells[index].querySelector('.bomb');
        holes[index] = setTimeout(() => { // 1초 뒤에 사라짐
          $bomb.classList.add('hidden');
          holes[index] = 0;
        }, 1000); 
        $bomb.classList.remove('hidden');
      }
    });
  }

  $$cells.forEach(($cell, index) => {
    $cell.querySelector('.gopher').addEventListener('click', (event) => {
      if (!event.target.classList.contains('dead')) {
        score += 1;
        $score.textContent = score;
      }
      event.target.classList.add('dead');
      event.target.classList.add('hidden');
      clearTimeout(holes[index]); // 기존 내려가는 타이머 제거
      setTimeout(() => {
        holes[index] = 0;
        event.target.classList.remove('dead');
      }, 1000);
    });
    $cell.querySelector('.bomb').addEventListener('click', (event) => {
      if (!event.target.classList.contains('boom')) {
        life--;
        $life.textContent = life;
      }
      event.target.classList.add('boom');
      event.target.classList.add('hidden');
      clearTimeout(holes[index]); // 기존 내려가는 타이머 제거
      setTimeout(() => {
        holes[index] = 0;
        event.target.classList.remove('boom');
      }, 1000);
      //목숨이 0이 되었을때
      if (life === 0) { 
        clearInterval(timerId);
        clearInterval(tickId);
        setTimeout(() => {
          alert(`게임 오버! 점수는 ${score}점입니다`);
        }, 50);
        const param = {
          name: nickname.value,
          score: score
        }
        //게임이 끝나면 서버로 유저와 점수 정보 전송
        socket.emit("score",param);
      }
    });
  });

  //서버로부터 유저와 점수 정보 받기
socket.on("score", (data) => {
  console.log(data)
  const {name, score, currentTime} = data;
  const item = new LiModel(name, score, currentTime);
  item.makeLi();
  displayContainer.scrollTo(0,displayContainer.scrollHeight)
})

  //ul에 점수 추가하기
function LiModel(name,score,currentTime){
  this.name = name;
  this.score = score;
  this.currentTime = currentTime;

  //시간, nickname, score li등록
  this.makeLi = ()=>{
    const li = document.createElement("li");
    const dom = `<img src="css/profile.png"> ${this.currentTime}   ${this.name}님이 ${this.score}점을 달성하셨습니다!!`;
  li.innerHTML = dom;
  scoreList.appendChild(li);
  }
}