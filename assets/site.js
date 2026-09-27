// Category chips: show only cards of the chosen kind (collections match any kind they contain).
(() => {
  const chips = document.querySelectorAll('.chips button'), cards = document.querySelectorAll('a.card')
  const apply = f => {
    chips.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === f)))
    cards.forEach(c => c.classList.toggle('hide', f !== 'all' && !c.dataset.kind.split(' ').includes(f)))
    try { sessionStorage.setItem('aemtti-filter', f) } catch (e) {}
  }
  chips.forEach(b => b.addEventListener('click', () => apply(b.dataset.f)))
  let saved = 'all'; try { saved = sessionStorage.getItem('aemtti-filter') || 'all' } catch (e) {}
  if (chips.length && [...chips].some(b => b.dataset.f === saved)) apply(saved)
})()
