$(function () {
  $('[data-toggle="popover"]').popover()
  $('[data-toggle="tooltip"]').tooltip()
555
  $.fn.extend({
    photo (num) {
      if (num !== undefined) $(this).css('background-image', `url(./img/${num}-min.jpg)`)
      else return $(this).css('background-image')
    },
    clear () {
      return this.each(function () {
        $(this).css('background-image', 'linear-gradient(white, #F5F5F5)')
      })
    }
  })
})

const $tiles = $('.tile')
const $tLeftWindow = $('.time')
const $name = $('.nameVal')
const $nameInput = $('#name')
const $scoreTotal = $('.res')
const $resultWindow = $('#resultWindow')
const $resultBody = $('.modal-body')
const $delayWindow = $('.delay')
const NUMBERS = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8]
let blocked = true
let total = 0
let testMode = false
let prevTime, prevDelay, first, srcFirst, waitingBetween, timeUpdating, timeLeft, delayLeft, delayUpdating

function startGame (time, delay = 5) {
  delayLeft = delay + 0.5
  $delayWindow.show()
  $tLeftWindow.html(time)

  delayUpdating = setInterval(() => $delayWindow.html((delayLeft -= 0.1).toFixed(1)), 100)

  prevTime = time
  prevDelay = delay

  NUMBERS.sort(() => Math.random() - 0.5)

  $tiles.each((i, tile) => $(tile).photo(NUMBERS[i]))

  setTimeout(() => {
    $tiles.clear()
    clearInterval(delayUpdating)
    $delayWindow.hide()
    blocked = false

    timeUpdating = setInterval(() => {
      timeLeft = --time

      if (timeLeft === 0) {
        clearInterval(timeUpdating)
        $resultWindow.modal({
          backdrop: 'static',
          keyboard: false
        })
        $resultBody.html(`Ваш результат <b>${total}</b> баллов из 80. Попробуйте еще! 😢`)
      }

      $tLeftWindow.html(timeLeft)
    }, 1000)

    if (time === undefined) clearInterval(timeUpdating)

    $tiles.on('click', function () {
      if (!blocked && first !== this && !$(this).hasClass('done')) {
        const index = $(this).index()
        $(this).photo(NUMBERS[index])

        if (first === undefined) {
          blocked = true
          srcFirst = $(this).photo()
          first = this
          blocked = false

          waitingBetween = setTimeout(() => {
            $(first).clear()
            first = undefined
          }, delay === 2 ? 500 : delay * 400)
        } else if ($(this).photo() !== srcFirst) {
          blocked = true
          clearTimeout(waitingBetween)

          setTimeout(() => {
            $([this, first]).clear()
            first = undefined
            blocked = false
          }, delay === 2 ? 100 : delay * 100)
        } else {
          clearTimeout(waitingBetween)
          $scoreTotal.html(total += 10)
          $([first, this]).addClass('done')
          first = undefined

          if (total === 80) {
            clearInterval(timeUpdating)
            $resultBody.html(testMode ? 'Вы победили (нечестно 😶).' : 'Вы победили. 🙂')
            $resultWindow.modal({
              backdrop: 'static',
              keyboard: false
            })
          }
        }
      }
    })
  }, delay * 1000 + 500)
}

$nameInput.on('input', () => $nameInput.removeClass('error'))

$('.againBtn').on('click', function () {
  $resultWindow.modal('hide')
  testMode ? startGame() : startGame(prevTime, prevDelay)
  $tiles.removeClass('done')
  $scoreTotal.html('0')
  total = 0
})

$('.startBtn').on('click', function () {
  if ($nameInput.val() === '') {
    $nameInput.addClass('error')
    $nameInput.focus()
  } else {
    $('.startWindow').fadeOut('200')

    setTimeout(() => {
      $('.game').fadeIn()
      $('.info').fadeIn()
      $delayWindow.fadeIn()

      $name.html($nameInput.val())
      $('.difVal').html($('input:radio:checked').next().html())

      if ($nameInput.val() === 'test') {
        testMode = true
        $name.addClass('test')
        startGame()
      } else {
        startGame(
          $('input:radio:checked').data('time'),
          $('input:radio:checked').data('delay')
        )
      }
    }, 400)
  }
})

$('html').on('keydown', e => {
  if (!blocked && e.key === 'Enter') {
    let tdas
    let a = [...NUMBERS]
    if (first !== undefined) $tiles.not('.done').first().click()
    setTimeout(() => {
      for (let i = 0; i < a.length; i++) {
        setTimeout(() => {
          $tiles[i].click()
          tdas = a[i]
          a[i] = 0
          $tiles[a.indexOf(tdas)].click()
          a[a.indexOf(tdas)] = 0
        }, i * 50)
      }
    }, 600)
  }
})
