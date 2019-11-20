import { ref, computed, reactive, watch } from './reactivity/es6';

const brick1 = reactive({ weight: 0 });
const brick2 = ref({ weight: 0 });

const totalWeight = computed(() => brick1.weight + brick2.value.weight);

let i = 0;
watch(() => {
  console.log(`== ${i++} ==`);
  console.log(brick1.weight);
  console.log(brick2.value.weight);
});

watch(() => {
  console.log(`total weight: ${totalWeight.value}`);
});

watch(() => {
  console.log(`This is weight for brick 2: ${brick2.value.weight}`);
});

watch(() => {
  console.log(`Name of brick1 1: ${brick1.name}`);
});

brick2.value = { weight: 30 };
brick1.name = 'hello world';
setInterval(() => {
  brick1.weight = Math.random();
  brick2.value.weight = Math.random();
}, 1000);
