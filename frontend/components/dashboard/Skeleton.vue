<template>
  <div class="dash-skeleton">
    <div class="dash-skeleton__kpis">
      <v-skeleton-loader v-for="n in 6" :key="`kpi-${n}`" type="article" class="dash-skeleton__kpi" boilerplate />
    </div>
    <div class="dash-skeleton__charts dash-skeleton__charts--wide">
      <v-skeleton-loader type="image" class="dash-skeleton__chart dash-skeleton__chart--wide" boilerplate />
      <v-skeleton-loader type="image" class="dash-skeleton__chart dash-skeleton__chart--narrow" boilerplate />
    </div>
    <div class="dash-skeleton__charts">
      <v-skeleton-loader type="image" class="dash-skeleton__chart" boilerplate />
      <v-skeleton-loader type="image" class="dash-skeleton__chart" boilerplate />
    </div>
    <div class="dash-skeleton__bottom">
      <v-skeleton-loader type="list-item-three-line@5" class="dash-skeleton__list" boilerplate />
      <v-skeleton-loader type="list-item-three-line@5" class="dash-skeleton__list" boilerplate />
    </div>
  </div>
</template>

<style scoped>
.dash-skeleton { display: flex; flex-direction: column; gap: 20px; }
.dash-skeleton__kpis {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
.dash-skeleton__kpi { border-radius: 16px !important; height: 140px; }
.dash-skeleton__charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.dash-skeleton__charts--wide { grid-template-columns: 2fr 1fr; }
.dash-skeleton__chart { border-radius: 16px !important; height: 380px; }
.dash-skeleton__bottom {
  display: grid;
  grid-template-columns: minmax(0, 360px) 1fr;
  gap: 16px;
}
.dash-skeleton__list { border-radius: 16px !important; min-height: 380px; }

@media (max-width: 1400px) {
  .dash-skeleton__kpis { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .dash-skeleton__kpis { grid-template-columns: repeat(2, 1fr); }
  .dash-skeleton__charts,
  .dash-skeleton__charts--wide { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .dash-skeleton__bottom { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .dash-skeleton__kpis { grid-template-columns: 1fr; }
}
</style>
