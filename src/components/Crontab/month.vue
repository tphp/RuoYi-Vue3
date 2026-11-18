<template>
    <el-form>
        <el-form-item>
            <el-radio v-model='radioValue' :value="1">
                {{ $t('crontab.month.wildcard') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :value="2">
                {{ $t('crontab.cycleFrom') }}
                <el-input-number v-model='cycle01' :min="1" :max="11" /> -
                <el-input-number v-model='cycle02' :min="cycle01 + 1" :max="12" /> {{ $t('crontab.unit.month') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :value="3">
                {{ $t('crontab.from') }}
                <el-input-number v-model='average01' :min="1" :max="11" /> {{ $t('crontab.unit.month') }}{{ $t('crontab.startAt') }}
                <el-input-number v-model='average02' :min="1" :max="12 - average01" /> {{ $t('crontab.unit.month') }}{{ $t('crontab.execEveryMonth') }}
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :value="4">
                {{ $t('crontab.specify') }}
                <el-select clearable v-model="checkboxList" :placeholder="$t('crontab.multiSelect')" multiple :multiple-limit="8">
                    <el-option v-for="item in monthList" :key="item.key" :label="item.value" :value="item.key" />
                </el-select>
            </el-radio>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
const emit = defineEmits(['update'])
const { proxy } = getCurrentInstance()!
const props = defineProps({
    cron: {
        type: Object,
        default: {
            second: "*",
            min: "*",
            hour: "*",
            day: "*",
            month: "*",
            week: "?",
            year: "",
        }
    },
    check: {
        type: Function,
        default: () => {
        }
    }
})
const radioValue = ref<number>(1)
const cycle01 = ref<number>(1)
const cycle02 = ref<number>(2)
const average01 = ref<number>(1)
const average02 = ref<number>(1)
const checkboxList = ref<number[]>([])
const checkCopy = ref<number[]>([1])
const monthList = computed<any[]>(() => [
    {key: 1, value: proxy.$t('crontab.month1')},
    {key: 2, value: proxy.$t('crontab.month2')},
    {key: 3, value: proxy.$t('crontab.month3')},
    {key: 4, value: proxy.$t('crontab.month4')},
    {key: 5, value: proxy.$t('crontab.month5')},
    {key: 6, value: proxy.$t('crontab.month6')},
    {key: 7, value: proxy.$t('crontab.month7')},
    {key: 8, value: proxy.$t('crontab.month8')},
    {key: 9, value: proxy.$t('crontab.month9')},
    {key: 10, value: proxy.$t('crontab.month10')},
    {key: 11, value: proxy.$t('crontab.month11')},
    {key: 12, value: proxy.$t('crontab.month12')}
])
const cycleTotal = computed(() => {
    cycle01.value = props.check(cycle01.value, 1, 11)
    cycle02.value = props.check(cycle02.value, cycle01.value + 1, 12)
    return cycle01.value + '-' + cycle02.value
})
const averageTotal = computed(() => {
    average01.value = props.check(average01.value, 1, 11)
    average02.value = props.check(average02.value, 1, 12 - average01.value)
    return average01.value + '/' + average02.value
})
const checkboxString = computed(() => {
    return checkboxList.value.join(',')
})
watch(() => props.cron.month, (value: string) => changeRadioValue(value))
watch([radioValue, cycleTotal, averageTotal, checkboxString], () => onRadioChange())
function changeRadioValue(value: string): void {
    if (value === '*') {
        radioValue.value = 1
    } else if (value.indexOf('-') > -1) {
        const indexArr = value.split('-')
        cycle01.value = Number(indexArr[0])
        cycle02.value = Number(indexArr[1])
        radioValue.value = 2
    } else if (value.indexOf('/') > -1) {
        const indexArr = value.split('/')
        average01.value = Number(indexArr[0])
        average02.value = Number(indexArr[1])
        radioValue.value = 3
    } else {
        checkboxList.value = [...new Set(value.split(',').map(item => Number(item)))]
        radioValue.value = 4
    }
}
function onRadioChange(): void {
    switch (radioValue.value) {
        case 1:
            emit('update', 'month', '*', 'month')
            break
        case 2:
            emit('update', 'month', cycleTotal.value, 'month')
            break
        case 3:
            emit('update', 'month', averageTotal.value, 'month')
            break
        case 4:
            if (checkboxList.value.length === 0) {
                checkboxList.value.push(checkCopy.value[0])
            } else {
                checkCopy.value = checkboxList.value
            }
            emit('update', 'month', checkboxString.value, 'month')
            break
    }
}
</script>

<style lang="scss" scoped>
.el-input-number--small, .el-select, .el-select--small {
    margin: 0 0.2rem;
}
.el-select, .el-select--small {
    width: 18.8rem;
}
</style>