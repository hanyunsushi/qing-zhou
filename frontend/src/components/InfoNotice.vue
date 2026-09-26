<template>
  <div class="info-notice" role="status">
    <span class="info-notice-icon" aria-hidden="true">!</span>
    <div class="info-notice-body"><slot /></div>
  </div>
</template>

<style scoped>
.info-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: var(--r-overlay);
  background: var(--accent-soft);
  box-shadow: none;
  color: var(--text-2);
  font-size: 12.5px;
  line-height: 1.7;
}
.info-notice-icon {
  display: grid;
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  place-items: center;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-family: var(--ff-body);
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
}
.info-notice-body { min-width: 0; flex: 1; }
.info-notice-body ul { margin: 6px 0 0; padding-left: 20px; }
.info-notice--manual { margin-bottom: 12px; }
.info-notice--settings { margin-bottom: 14px; }
.info-notice--update { margin-top: 8px; }
.info-notice--update-flow { margin-top: 16px; }
</style>
