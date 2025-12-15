<template>
  <div class="logo-container" :class="{ 'logo-small': size === 'small' }">
    <svg :width="width" :height="height" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#11998e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#38ef7d;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="logoGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#38ef7d;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#11998e;stop-opacity:0.3" />
        </linearGradient>
      </defs>

      <!-- 外圈 - 科技感圆环 -->
      <circle cx="60" cy="60" r="54" stroke="url(#logoGradientLight)" stroke-width="2" fill="none"
              stroke-dasharray="8 4" class="rotating-ring" />

      <!-- 内圈 - 实心圆环 -->
      <circle cx="60" cy="60" r="48" stroke="url(#logoGradient)" stroke-width="3" fill="none" />

      <!-- 字母 M 的抽象几何设计 -->
      <!-- 左边的线条 -->
      <path d="M 35 70 L 35 40 L 48 55 L 48 70"
            stroke="url(#logoGradient)"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none" />

      <!-- 右边的线条 -->
      <path d="M 85 70 L 85 40 L 72 55 L 72 70"
            stroke="url(#logoGradient)"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none" />

      <!-- 中间连接 - 形成 M 的中间部分 -->
      <path d="M 48 55 L 60 65 L 72 55"
            stroke="url(#logoGradient)"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none" />

      <!-- 科技感点缀 - 四个小圆点 -->
      <circle cx="35" cy="38" r="3" fill="url(#logoGradient)" class="pulse-dot" style="animation-delay: 0s" />
      <circle cx="85" cy="38" r="3" fill="url(#logoGradient)" class="pulse-dot" style="animation-delay: 0.3s" />
      <circle cx="48" cy="72" r="3" fill="url(#logoGradient)" class="pulse-dot" style="animation-delay: 0.6s" />
      <circle cx="72" cy="72" r="3" fill="url(#logoGradient)" class="pulse-dot" style="animation-delay: 0.9s" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium' // small, medium, large
  }
})

const dimensions = {
  small: { width: 40, height: 40 },
  medium: { width: 60, height: 60 },
  large: { width: 80, height: 80 }
}

const width = computed(() => dimensions[props.size]?.width || 60)
const height = computed(() => dimensions[props.size]?.height || 60)
</script>

<style scoped>
.logo-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 旋转动画 - 外圈 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotating-ring {
  transform-origin: center;
  animation: rotate 20s linear infinite;
}

/* 脉冲动画 - 点 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.pulse-dot {
  animation: pulse 2s ease-in-out infinite;
}

/* Hover 效果 */
.logo-container:hover .rotating-ring {
  animation-duration: 5s;
}

.logo-container:hover .pulse-dot {
  animation-duration: 1s;
}
</style>
