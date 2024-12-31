<template>
  <transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <header>
          <h2>{{ ad.title }}</h2>
          <button @click="close">&times;</button>
        </header>
        <main>
          <p>{{ ad.description }}</p>
          <span class="status">{{ ad.status }}</span>
        </main>
        <footer>
          <button @click="close">关闭</button>
        </footer>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  name: 'AdDetailsModal',
  props: {
    show: Boolean,
    ad: Object
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
};
</script>
<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
  overflow: hidden;

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #ff6700;
    color: #fff;

    h2 {
      margin: 0;
      font-size: 1.5em;
    }

    button {
      background: none;
      border: none;
      font-size: 1.5em;
      color: #fff;
      cursor: pointer;
    }
  }

  main {
    padding: 1rem;

    p {
      margin: 0 0 1rem 0;
    }

    .status {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875em;
      font-weight: bold;
      color: white;
      background-color: #ff6700;
    }
  }

  footer {
    padding: 1rem;
    text-align: right;

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: #fff;
      background-color: #ff6700;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: darken(#ff6700, 10%);
      }
    }
  }
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter, .modal-fade-leave-to {
  opacity: 0;
}
</style>