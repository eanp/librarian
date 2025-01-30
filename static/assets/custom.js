document.addEventListener('DOMContentLoaded', (event) => {
  const menuButton = document.getElementById('menuButton');
  const sidebar = document.getElementById('sidebar');
  const sectionButtons = document.querySelectorAll('nav button');

  menuButton.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  sectionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const ul = button.nextElementSibling;
      ul.classList.toggle('hidden');
      const svg = button.querySelector('svg');
      svg.classList.toggle('rotate-90');
    });
  });
});
