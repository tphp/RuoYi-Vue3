<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- 权限结构 -->
      <el-tab-pane label="权限结构" name="tree">
        <el-form :model="filters" ref="treeQueryRef" :inline="true">
          <el-form-item label="场景编码" prop="policyCode">
            <el-input v-model="filters.policyCode" placeholder="请输入场景编码" clearable style="width: 180px" @keyup.enter="handleTreeQuery" />
          </el-form-item>
          <el-form-item label="归属人工号" prop="ownerUserCode">
            <el-input v-model="filters.ownerUserCode" placeholder="请输入归属人工号" clearable style="width: 180px" @keyup.enter="handleTreeQuery" />
          </el-form-item>
          <el-form-item label="关键字" prop="keyword">
            <el-input v-model="filters.keyword" placeholder="名称 / 编码 / 工号" clearable style="width: 180px" @keyup.enter="handleTreeQuery" />
          </el-form-item>
          <el-form-item label="统计人数">
            <el-switch v-model="withCount" @change="handleTreeQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleTreeQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetTreeQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-empty v-if="!treeLoading && treeData.length === 0" description="暂无权限配置" />
        <el-tree
          v-else
          ref="treeRef"
          v-loading="treeLoading"
          :data="treeData"
          node-key="nodeKey"
          :props="treeProps"
          :default-expanded-keys="expandedKeys"
          highlight-current
          @node-expand="handleNodeExpand"
          @node-click="handleNodeClick"
        >
          <template #default="{ data }">
            <span class="perm-node">
              <span :class="['perm-label', data.disabled ? 'is-disabled' : '']">{{ data.label }}</span>
              <el-tag v-if="data.nodeType === 'OWNER'" size="small" type="info">归属人</el-tag>
              <el-tag v-if="data.nodeType === 'SCENE'" size="small" type="warning">场景</el-tag>
              <el-tag v-if="data.nodeType === 'DEPT'" size="small" type="primary">部门</el-tag>
              <el-tag v-if="data.nodeType === 'SCOPE'" size="small" type="success">范围</el-tag>
              <el-tag v-if="data.nodeType === 'EMPLOYEE'" size="small">员工</el-tag>
              <el-tag v-if="isCrossDept(data)" size="small" type="danger" effect="plain">跨部门</el-tag>
              <el-tag v-if="data.label && data.label.indexOf('（含下级）') > -1" size="small" type="info" effect="plain">含下级</el-tag>
              <el-tag v-if="data.disabled" size="small" type="info" effect="plain">已停用</el-tag>
              <el-tag v-if="data.extra && data.extra.userCount" size="small" type="success" effect="plain">{{ data.extra.userCount }} 人</el-tag>
            </span>
          </template>
        </el-tree>
      </el-tab-pane>

      <!-- 策略列表 -->
      <el-tab-pane label="策略列表" name="list">
        <el-form :model="policyQuery" ref="policyQueryRef" :inline="true" v-show="showSearch">
          <el-form-item label="场景编码" prop="policyCode">
            <el-input v-model="policyQuery.policyCode" placeholder="请输入场景编码" clearable style="width: 180px" @keyup.enter="handlePolicyQuery" />
          </el-form-item>
          <el-form-item label="场景名称" prop="policyName">
            <el-input v-model="policyQuery.policyName" placeholder="请输入场景名称" clearable style="width: 180px" @keyup.enter="handlePolicyQuery" />
          </el-form-item>
          <el-form-item label="归属人类型" prop="subjectType">
            <el-select v-model="policyQuery.subjectType" placeholder="请选择" clearable style="width: 140px">
              <el-option label="人员" value="USER" />
              <el-option label="岗位" value="POST" />
              <el-option label="部门" value="DEPT" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="policyQuery.status" placeholder="请选择" clearable style="width: 120px">
              <el-option label="启用" value="0" />
              <el-option label="停用" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handlePolicyQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetPolicyQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['bizperm:policy:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['bizperm:policy:remove']">删除</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getPolicyList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="policyList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="场景编码" align="center" prop="policyCode" :show-overflow-tooltip="true" min-width="140" />
          <el-table-column label="场景名称" align="center" prop="policyName" :show-overflow-tooltip="true" min-width="140" />
          <el-table-column label="归属人类型" align="center" prop="subjectType" width="110">
            <template #default="scope">
              <el-tag size="small">{{ subjectTypeLabel(scope.row.subjectType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="归属人" align="center" min-width="140">
            <template #default="scope">{{ scope.row.subjectName || scope.row.subjectValue }}</template>
          </el-table-column>
          <el-table-column label="含下级" align="center" prop="includeChild" width="90">
            <template #default="scope">{{ isIncludeChild(scope.row) ? '是' : '否' }}</template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="status" width="90">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                :loading="scope.row.statusLoading === true"
                v-hasPermi="['bizperm:policy:edit']"
                @change="(val: any) => handleStatusChange(scope.row, val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="更新时间" align="center" prop="updateTime" width="160" />
          <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['bizperm:policy:edit']">修改</el-button>
              <el-button link type="danger" icon="Delete" @click="handleDeleteRow(scope.row)" v-hasPermi="['bizperm:policy:remove']">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="policyTotal > 0" :total="policyTotal" v-model:page="policyQuery.pageNum" v-model:limit="policyQuery.pageSize" @pagination="getPolicyList" />
      </el-tab-pane>

      <!-- 员工权限查询 -->
      <el-tab-pane label="员工权限查询" name="user">
        <el-form :inline="true">
          <el-form-item label="员工">
            <el-select
              v-model="queryUserCode"
              filterable
              remote
              clearable
              :remote-method="searchUsers"
              placeholder="输入姓名或工号搜索"
              style="width: 260px"
              @change="handleQueryUserChange"
            >
              <el-option v-for="item in userOptions" :key="item.userName" :label="userLabel(item)" :value="item.userName" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" :loading="userTreeLoading" @click="handleUserTreeQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetUserTreeQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-empty v-if="!userTreeLoading && !queryUserCode" description="请选择要查询的员工" />

        <template v-else>
          <el-tree
            ref="userTreeRef"
            v-loading="userTreeLoading"
            :data="userTreeData"
            node-key="nodeKey"
            :props="treeProps"
            @node-expand="handleUserNodeExpand"
            @node-click="handleUserNodeClick"
          >
            <template #default="{ data }">
              <span class="perm-node">
                <span class="perm-label" :class="data.disabled ? 'is-disabled' : ''">{{ data.label }}</span>
                <el-tag v-if="data.nodeType === 'SCENE'" size="small" type="warning">场景</el-tag>
                <el-tag v-if="data.nodeType === 'DEPT'" size="small" type="primary">部门</el-tag>
                <el-tag v-if="data.nodeType === 'SCOPE'" size="small" type="success">范围</el-tag>
                <el-tag v-if="data.nodeType === 'EMPLOYEE'" size="small">员工</el-tag>
                <el-tag v-if="isCrossDept(data)" size="small" type="danger" effect="plain">跨部门</el-tag>
                <el-tag v-if="data.label && data.label.indexOf('（含下级）') > -1" size="small" type="info" effect="plain">含下级</el-tag>
                <el-tag v-if="data.extra && data.extra.userCount" size="small" type="success" effect="plain">{{ data.extra.userCount }} 人</el-tag>
              </span>
            </template>
          </el-tree>

          <el-divider content-position="left">可见员工明细</el-divider>
          <el-form :model="visibleQuery" :inline="true">
            <el-form-item label="场景">
              <el-select v-model="visibleQuery.policyCode" placeholder="请选择场景" filterable style="width: 220px" @change="handleVisibleQuery">
                <el-option v-for="item in sceneOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="员工">
              <el-input v-model="visibleQuery.keyword" placeholder="姓名 / 工号" clearable style="width: 180px" @keyup.enter="handleVisibleQuery" />
            </el-form-item>
            <el-form-item label="按部门分组">
              <el-switch v-model="visibleQuery.groupByDept" @change="handleVisibleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleVisibleQuery">查询</el-button>
              <el-button icon="Refresh" @click="resetVisibleQuery">重置</el-button>
            </el-form-item>
          </el-form>

          <template v-if="visibleQuery.groupByDept">
            <el-table v-loading="visibleLoading" :data="visibleDeptGroups" row-key="deptId" border>
              <el-table-column type="expand">
                <template #default="scope">
                  <el-table :data="scope.row.users || []" size="small" class="expand-table">
                    <el-table-column label="工号" prop="userCode" width="160" />
                    <el-table-column label="姓名" prop="nickName" width="160" />
                    <el-table-column label="所属部门" prop="deptName" />
                  </el-table>
                </template>
              </el-table-column>
              <el-table-column label="配置部门" prop="deptName" min-width="200" />
              <el-table-column label="含下级" align="center" width="90">
                <template #default="scope">{{ normalizeFlag(scope.row.includeChild) === '1' ? '是' : '否' }}</template>
              </el-table-column>
              <el-table-column label="部门人数" prop="userCount" align="center" width="110" />
              <el-table-column label="本页返回" prop="returnedCount" align="center" width="110" />
            </el-table>
          </template>
          <el-table v-else v-loading="visibleLoading" :data="visibleUsers" border>
            <el-table-column label="工号" prop="userCode" width="180" />
            <el-table-column label="姓名" prop="nickName" width="180" />
            <el-table-column label="所属部门" prop="deptName" />
          </el-table>

          <pagination v-show="visibleTotal > 0" :total="visibleTotal" v-model:page="visibleQuery.pageNum" v-model:limit="visibleQuery.pageSize" @pagination="loadVisibleUsers" />
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增 / 修改策略 -->
    <el-dialog :title="dialogTitle" v-model="dialogOpen" width="900px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="场景编码" prop="policyCode">
              <el-select v-model="form.policyCode" placeholder="请选择或输入场景编码" filterable allow-create default-first-option style="width: 100%">
                <el-option v-for="item in biz_perm_policy" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="场景名称" prop="policyName">
              <el-input v-model="form.policyName" placeholder="请输入场景名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属人类型" prop="subjectType">
              <el-select v-model="form.subjectType" style="width: 100%" @change="handleSubjectTypeChange">
                <el-option label="人员" value="USER" />
                <el-option label="岗位" value="POST" />
                <el-option label="部门" value="DEPT" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限归属人" prop="subjectValue">
              <el-select
                v-if="form.subjectType === 'USER'"
                v-model="form.subjectValue"
                filterable
                remote
                :remote-method="searchUsers"
                placeholder="输入姓名或工号搜索"
                style="width: 100%"
                @change="(val: any) => handleUserChange(val, 'subject')"
              >
                <el-option v-for="item in userOptions" :key="item.userName" :label="userLabel(item)" :value="item.userName" />
              </el-select>
              <el-select v-else-if="form.subjectType === 'POST'" v-model="form.subjectValue" placeholder="请选择岗位" style="width: 100%" @change="(val: any) => handlePostChange(val, 'subject')">
                <el-option v-for="item in postOptions" :key="item.postId" :label="item.postName" :value="String(item.postId)" />
              </el-select>
              <el-tree-select
                v-else
                v-model="form.subjectValue"
                :data="deptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                check-strictly
                filterable
                placeholder="请选择部门"
                style="width: 100%"
                @change="(val: any) => handleDeptChange(val, 'subject')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属人名称">
              <el-input v-model="form.subjectName" placeholder="选择归属人后自动填充" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门含下级" v-if="form.subjectType === 'DEPT'">
              <el-switch v-model="form.includeChild" active-value="1" inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio value="0">启用</el-radio>
                <el-radio value="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">可见范围</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" size="small" @click="handleAddScope">添加范围</el-button>
          </el-col>
        </el-row>
        <el-table :data="form.scopes" size="small" border>
          <el-table-column label="范围类型" width="130" align="center">
            <template #default="scope">
              <el-select v-model="scope.row.scopeType" size="small" @change="handleScopeTypeChange(scope.row)">
                <el-option label="部门" value="DEPT" />
                <el-option label="岗位" value="POST" />
                <el-option label="人员" value="USER" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="范围值" min-width="220">
            <template #default="scope">
              <el-tree-select
                v-if="scope.row.scopeType === 'DEPT'"
                v-model="scope.row.scopeValue"
                :data="deptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                check-strictly
                filterable
                size="small"
                style="width: 100%"
                @change="(val: any) => handleDeptChange(val, 'scope', scope.row)"
              />
              <el-select
                v-else-if="scope.row.scopeType === 'POST'"
                v-model="scope.row.scopeValue"
                filterable
                size="small"
                style="width: 100%"
                @change="(val: any) => handlePostChange(val, 'scope', scope.row)"
              >
                <el-option v-for="item in postOptions" :key="item.postId" :label="item.postName" :value="String(item.postId)" />
              </el-select>
              <el-select
                v-else
                v-model="scope.row.scopeValue"
                filterable
                remote
                :remote-method="searchUsers"
                size="small"
                style="width: 100%"
                @change="(val: any) => handleUserChange(val, 'scope', scope.row)"
              >
                <el-option v-for="item in userOptions" :key="item.userName" :label="userLabel(item)" :value="item.userName" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="范围名称" min-width="160">
            <template #default="scope">
              <el-input v-model="scope.row.scopeName" size="small" placeholder="自动填充，可修改" />
            </template>
          </el-table-column>
          <el-table-column label="含下级" width="90" align="center">
            <template #default="scope">
              <el-switch v-model="scope.row.includeChild" active-value="1" inactive-value="0" :disabled="scope.row.scopeType !== 'DEPT'" />
            </template>
          </el-table-column>
          <el-table-column label="排序" width="90" align="center">
            <template #default="scope">
              <el-input-number v-model="scope.row.orderNum" :min="0" size="small" controls-position="right" style="width: 70px" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="scope">
              <el-button link type="danger" icon="Delete" @click="handleRemoveScope(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-alert
          v-if="!form.isEdit"
          title="修改时不提交可见范围表格则保持原范围不变；提交则整体替换"
          type="warning"
          :closable="false"
          style="margin-top: 8px"
        />
      </el-form>

      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dialogOpen = false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  getPermTree,
  getPermTreeChildren,
  getUserPermTree,
  getUserVisibleUsers,
  listPolicy,
  getPolicy,
  addPolicy,
  updatePolicy,
  delPolicy
} from '@/api/bizperm/policy'
import { listUser, deptTreeSelect } from '@/api/system/user'
import { listPost } from '@/api/system/post'
import { useDict } from '@/utils/dict'
import type {
  BizPermTreeNode,
  BizPermPolicy,
  BizPermPolicyQuery,
  BizPermScope,
  VisibleUser,
  VisibleDeptGroup
} from '@/types'

const { proxy } = getCurrentInstance() as any
const { biz_perm_policy } = useDict('biz_perm_policy')

/** 员工分页大小，与后端上限 200 对齐 */
const EMP_PAGE_SIZE = 50

const activeTab = ref('tree')
const showSearch = ref(true)
const withCount = ref(true)
const expandedKeys = ref<string[]>([])

/* ---------------- 权限结构树 ---------------- */
const treeRef = ref()
const treeLoading = ref(false)
const treeData = ref<BizPermTreeNode[]>([])
const filters = reactive({ policyCode: '', ownerUserCode: '', keyword: '' })
const treeProps = { label: 'label', children: 'children', isLeaf: (data: BizPermTreeNode) => data.leaf === true }
/** 已加载子级的节点，避免重复请求 */
const loadedKeys = ref<Set<string>>(new Set())

/** 加载首屏三层树 */
async function loadTree() {
  treeLoading.value = true
  try {
    const res = await getPermTree({
      depth: 3,
      withCount: withCount.value,
      policyCode: filters.policyCode || undefined,
      ownerUserCode: filters.ownerUserCode || undefined,
      keyword: filters.keyword || undefined
    })
    treeData.value = res.data?.nodes || []
    loadedKeys.value = new Set()
  } finally {
    treeLoading.value = false
  }
}

/** 树查询 */
function handleTreeQuery() {
  loadTree()
}

/** 重置树查询条件 */
function resetTreeQuery() {
  filters.policyCode = ''
  filters.ownerUserCode = ''
  filters.keyword = ''
  withCount.value = true
  loadTree()
}

/**
 * 拉取节点子级（员工分页）
 * @param data 父节点
 * @param pageNum 页码
 */
async function fetchChildren(data: BizPermTreeNode, pageNum: number) {
  const res = await getPermTreeChildren({
    nodeKey: data.nodeKey,
    nodeType: data.nodeType,
    pageNum,
    pageSize: EMP_PAGE_SIZE
  })
  const payload = res.data || { total: 0, nodes: [] }
  const nodes: BizPermTreeNode[] = [...(payload.nodes || [])]
  const total = payload.total || 0
  const loaded = (pageNum - 1) * EMP_PAGE_SIZE + nodes.length
  if (loaded < total) {
    nodes.push({
      nodeKey: `MORE:${data.nodeKey}:${pageNum + 1}`,
      nodeType: 'MORE',
      label: `加载更多（已加载 ${loaded}/${total}）`,
      leaf: true,
      extra: { parentKey: data.nodeKey, nextPage: pageNum + 1 }
    })
  }
  return { total, nodes }
}

/** 展开节点时按需加载子级 */
async function handleNodeExpand(data: BizPermTreeNode) {
  if (!['SCENE', 'DEPT', 'SCOPE'].includes(data.nodeType)) {
    return
  }
  if (loadedKeys.value.has(data.nodeKey)) {
    return
  }
  loadedKeys.value.add(data.nodeKey)
  try {
    const payload = await fetchChildren(data, 1)
    treeRef.value?.updateKeyChildren(data.nodeKey, payload.nodes)
  } catch (e) {
    loadedKeys.value.delete(data.nodeKey)
  }
}

/** 点击“加载更多”追加下一页员工 */
async function handleNodeClick(data: BizPermTreeNode, node: any) {
  if (data.nodeType !== 'MORE') {
    return
  }
  const parentNode = node.parent
  if (!parentNode) {
    return
  }
  const nextPage = data.extra?.nextPage || 2
  const payload = await fetchChildren(parentNode.data, nextPage)
  treeRef.value?.remove(node)
  treeRef.value?.append(payload.nodes, parentNode)
}

/** 是否跨部门（场景下配置了多个部门） */
function isCrossDept(data: BizPermTreeNode) {
  return data.nodeType === 'SCENE' && Number(data.extra?.deptCount || 0) > 1
}

/**
 * 归一化「含下级」标记
 * 兼容后端返回 true / 1 / "true" / "1" 以及带空格的定长字符标记
 * @param val 原始值
 * @returns '1' 表示是，'0' 表示否
 */
function normalizeFlag(val: any): string {
  const text = val === true ? '1' : String(val ?? '').trim()
  return text === '1' || text.toLowerCase() === 'true' ? '1' : '0'
}

/**
 * 判断策略是否包含下级部门
 * 归属人为部门时看策略自身的含下级，可见范围为部门时看范围行的含下级
 * @param row 策略行
 * @returns true 表示包含下级
 */
function isIncludeChild(row: BizPermPolicy): boolean {
  return normalizeFlag(row.includeChild) === '1' || normalizeFlag(row.scopeIncludeChild) === '1'
}

/* ---------------- 员工权限查询 ---------------- */
const queryUserCode = ref('')
const userTreeRef = ref()
const userTreeLoading = ref(false)
const userTreeData = ref<BizPermTreeNode[]>([])
/** 已加载子级的节点，避免重复请求 */
const userLoadedKeys = ref<Set<string>>(new Set())

/** 从员工权限树中提取场景下拉项 */
const sceneOptions = computed(() => {
  const options: { label: string; value: string }[] = []
  const walk = (nodes: BizPermTreeNode[]) => {
    nodes.forEach(node => {
      if (node.nodeType === 'SCENE' && node.code) {
        options.push({ label: node.label, value: node.code })
      }
      if (node.children && node.children.length > 0) {
        walk(node.children)
      }
    })
  }
  walk(userTreeData.value)
  return options
})

/** 清空可见员工明细 */
function clearVisibleUsers() {
  visibleUsers.value = []
  visibleDeptGroups.value = []
  visibleTotal.value = 0
}

/** 切换查询员工时重置下级数据 */
function handleQueryUserChange() {
  userTreeData.value = []
  userLoadedKeys.value = new Set()
  visibleQuery.value.policyCode = ''
  visibleQuery.value.keyword = ''
  visibleQuery.value.groupByDept = false
  visibleQuery.value.pageNum = 1
  clearVisibleUsers()
}

/** 加载指定员工的权限树 */
async function loadUserTree() {
  if (!queryUserCode.value) {
    proxy?.$modal.msgWarning('请先选择要查询的员工')
    return
  }
  userTreeLoading.value = true
  try {
    const res = await getUserPermTree(queryUserCode.value, { depth: 3, withCount: true })
    userTreeData.value = res.data?.nodes || []
    userLoadedKeys.value = new Set()
    // 默认选中第一个场景，直接展示可见员工明细
    const first = sceneOptions.value[0]
    if (first) {
      visibleQuery.value.policyCode = first.value
      visibleQuery.value.pageNum = 1
      loadVisibleUsers()
    } else {
      clearVisibleUsers()
    }
  } finally {
    userTreeLoading.value = false
  }
}

/** 员工权限树查询 */
function handleUserTreeQuery() {
  loadUserTree()
}

/** 重置员工权限查询 */
function resetUserTreeQuery() {
  queryUserCode.value = ''
  handleQueryUserChange()
}

/** 员工权限树展开时按需加载子级 */
async function handleUserNodeExpand(data: BizPermTreeNode) {
  if (!['SCENE', 'DEPT', 'SCOPE'].includes(data.nodeType) || userLoadedKeys.value.has(data.nodeKey)) {
    return
  }
  userLoadedKeys.value.add(data.nodeKey)
  try {
    const payload = await fetchChildren(data, 1)
    userTreeRef.value?.updateKeyChildren(data.nodeKey, payload.nodes)
  } catch (e) {
    userLoadedKeys.value.delete(data.nodeKey)
  }
}

/** 点击“加载更多”追加下一页员工 */
async function handleUserNodeClick(data: BizPermTreeNode, node: any) {
  if (data.nodeType !== 'MORE') {
    return
  }
  const parentNode = node.parent
  if (!parentNode) {
    return
  }
  const payload = await fetchChildren(parentNode.data, data.extra?.nextPage || 2)
  userTreeRef.value?.remove(node)
  userTreeRef.value?.append(payload.nodes, parentNode)
}

/* ---------------- 员工可见员工明细 ---------------- */
const visibleLoading = ref(false)
const visibleUsers = ref<VisibleUser[]>([])
const visibleDeptGroups = ref<VisibleDeptGroup[]>([])
const visibleTotal = ref(0)
const visibleQuery = ref({
  policyCode: '',
  keyword: '',
  groupByDept: false,
  pageNum: 1,
  pageSize: 20
})

/** 查询指定员工在某场景下的可见员工 */
function loadVisibleUsers() {
  if (!queryUserCode.value || !visibleQuery.value.policyCode) {
    clearVisibleUsers()
    return
  }
  visibleLoading.value = true
  getUserVisibleUsers(queryUserCode.value, { ...visibleQuery.value })
    .then(res => {
      const data = res.data || {}
      visibleTotal.value = data.total || 0
      if (visibleQuery.value.groupByDept) {
        visibleDeptGroups.value = data.departments || []
        visibleUsers.value = []
      } else {
        visibleUsers.value = data.users || []
        visibleDeptGroups.value = []
      }
    })
    .finally(() => {
      visibleLoading.value = false
    })
}

/** 可见员工查询 */
function handleVisibleQuery() {
  visibleQuery.value.pageNum = 1
  loadVisibleUsers()
}

/** 重置可见员工查询 */
function resetVisibleQuery() {
  visibleQuery.value.policyCode = ''
  visibleQuery.value.keyword = ''
  visibleQuery.value.groupByDept = false
  visibleQuery.value.pageNum = 1
  clearVisibleUsers()
}

/* ---------------- 策略列表 ---------------- */
const loading = ref(false)
const policyList = ref<BizPermPolicy[]>([])
const policyTotal = ref(0)
const ids = ref<number[]>([])
const multiple = ref(true)
const policyQuery = ref<BizPermPolicyQuery>({ pageNum: 1, pageSize: 10 })

/** 查询策略列表 */
function getPolicyList() {
  loading.value = true
  listPolicy(policyQuery.value)
    .then(res => {
      policyList.value = res.rows
      policyTotal.value = res.total
    })
    .finally(() => {
      loading.value = false
    })
}

/** 策略查询 */
function handlePolicyQuery() {
  policyQuery.value.pageNum = 1
  getPolicyList()
}

/** 重置策略查询 */
function resetPolicyQuery() {
  proxy?.$refs.policyQueryRef?.resetFields()
  policyQuery.value.pageNum = 1
  getPolicyList()
}

/** 多选 */
function handleSelectionChange(selection: BizPermPolicy[]) {
  ids.value = selection.map(item => item.id as number)
  multiple.value = selection.length === 0
}

/** 归属人类型文案 */
function subjectTypeLabel(type?: string) {
  return type === 'USER' ? '人员' : type === 'POST' ? '岗位' : type === 'DEPT' ? '部门' : type
}

/**
 * 表格内直接切换策略启用状态
 * @param row 策略行
 * @param val 切换后的状态：0启用 1停用
 */
async function handleStatusChange(row: BizPermPolicy, val: string) {
  const action = val === '0' ? '启用' : '停用'
  try {
    await proxy?.$modal.confirm('是否确认' + action + '场景「' + row.policyName + '」？')
  } catch (e) {
    // 取消时回滚开关
    row.status = val === '0' ? '1' : '0'
    return
  }
  ;(row as any).statusLoading = true
  updatePolicy({ ...row, includeChild: normalizeFlag(row.includeChild), status: val })
    .then(() => proxy?.$modal.msgSuccess(action + '成功'))
    .catch(() => {
      row.status = val === '0' ? '1' : '0'
    })
    .finally(() => {
      ;(row as any).statusLoading = false
    })
}

/* ---------------- 新增 / 修改 ---------------- */
const dialogOpen = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const form = ref<BizPermPolicy & { isEdit?: boolean }>({})
const deptOptions = ref<any[]>([])
const postOptions = ref<any[]>([])
const userOptions = ref<any[]>([])

const formRules = {
  policyCode: [{ required: true, message: '请选择或输入场景编码', trigger: 'change' }],
  policyName: [{ required: true, message: '请输入场景名称', trigger: 'blur' }],
  subjectType: [{ required: true, message: '请选择归属人类型', trigger: 'change' }],
  subjectValue: [{ required: true, message: '请选择权限归属人', trigger: 'change' }]
}

/** 重置表单 */
function resetForm() {
  form.value = {
    policyCode: '',
    policyName: '',
    subjectType: 'USER',
    subjectValue: '',
    subjectName: '',
    includeChild: '0',
    status: '0',
    remark: '',
    scopes: []
  }
}

/** 新增 */
function handleAdd() {
  resetForm()
  form.value.isEdit = false
  dialogTitle.value = '新增权限策略'
  dialogOpen.value = true
}

/** 修改 */
async function handleUpdate(row: BizPermPolicy) {
  resetForm()
  const res = await getPolicy(row.id as number)
  const data = (res.data || {}) as BizPermPolicy
  form.value = {
    ...data,
    subjectValue: data.subjectValue === undefined || data.subjectValue === null ? '' : String(data.subjectValue),
    includeChild: normalizeFlag(data.includeChild),
    scopes: (data.scopes || []).map(scope => ({
      ...scope,
      scopeValue: String(scope.scopeValue),
      includeChild: normalizeFlag(scope.includeChild),
      orderNum: scope.orderNum || 0
    })),
    isEdit: true
  }
  dialogTitle.value = '修改权限策略'
  dialogOpen.value = true
}

/** 切换归属人类型时清空已选值 */
function handleSubjectTypeChange() {
  form.value.subjectValue = ''
  form.value.subjectName = ''
  if (form.value.subjectType !== 'DEPT') {
    form.value.includeChild = '0'
  }
}

/** 添加范围行 */
function handleAddScope() {
  if (!form.value.scopes) {
    form.value.scopes = []
  }
  form.value.scopes.push({
    scopeType: 'DEPT',
    scopeValue: '',
    scopeName: '',
    includeChild: '0',
    orderNum: form.value.scopes.length
  })
}

/** 删除范围行 */
function handleRemoveScope(index: number) {
  form.value.scopes?.splice(index, 1)
}

/** 切换范围类型时清空已选值 */
function handleScopeTypeChange(row: BizPermScope) {
  row.scopeValue = ''
  row.scopeName = ''
  row.includeChild = '0'
}

/** 员工显示名 */
function userLabel(user: any) {
  return user.nickName ? `${user.nickName}（${user.userName}）` : user.userName
}

/** 远程搜索人员 */
function searchUsers(keyword: string) {
  listUser({ pageNum: 1, pageSize: 50, userName: keyword } as any).then(res => {
    userOptions.value = res.rows || []
  })
}

/**
 * 归属人 / 范围选择人员后回填名称
 * @param val 工号
 * @param target subject 或 scope
 * @param row 范围行
 */
function handleUserChange(val: string, target: 'subject' | 'scope', row?: BizPermScope) {
  const hit = userOptions.value.find((item: any) => item.userName === val)
  const name = hit ? userLabel(hit) : val
  if (target === 'subject') {
    form.value.subjectName = name
  } else if (row) {
    row.scopeName = name
  }
}

/**
 * 归属人 / 范围选择岗位后回填名称
 * @param val 岗位ID
 * @param target subject 或 scope
 * @param row 范围行
 */
function handlePostChange(val: string, target: 'subject' | 'scope', row?: BizPermScope) {
  const hit = postOptions.value.find((item: any) => String(item.postId) === String(val))
  const name = hit ? hit.postName : val
  if (target === 'subject') {
    form.value.subjectName = name
  } else if (row) {
    row.scopeName = name
  }
}

/**
 * 归属人 / 范围选择部门后回填名称
 * @param val 部门ID
 * @param target subject 或 scope
 * @param row 范围行
 */
function handleDeptChange(val: any, target: 'subject' | 'scope', row?: BizPermScope) {
  const name = findDeptLabel(deptOptions.value, val) || String(val)
  if (target === 'subject') {
    form.value.subjectValue = String(val)
    form.value.subjectName = name
  } else if (row) {
    row.scopeValue = String(val)
    row.scopeName = name
  }
}

/**
 * 递归查找部门名称
 * @param nodes 部门树
 * @param id 部门ID
 */
function findDeptLabel(nodes: any[], id: any): string {
  for (const node of nodes) {
    if (String(node.id) === String(id)) {
      return node.label
    }
    if (node.children && node.children.length > 0) {
      const hit = findDeptLabel(node.children, id)
      if (hit) {
        return hit
      }
    }
  }
  return ''
}

/** 提交表单 */
async function submitForm() {
  await formRef.value.validate()
  const scopes = (form.value.scopes || []).filter((item: BizPermScope) => item.scopeValue)
  for (const scope of scopes) {
    if (!scope.scopeType || !scope.scopeValue) {
      proxy?.$modal.msgError('可见范围类型和范围值不能为空')
      return
    }
  }
  const payload: BizPermPolicy = {
    id: form.value.id,
    policyCode: form.value.policyCode,
    policyName: form.value.policyName,
    subjectType: form.value.subjectType,
    subjectValue: String(form.value.subjectValue),
    subjectName: form.value.subjectName,
    includeChild: normalizeFlag(form.value.includeChild),
    status: form.value.status || '0',
    remark: form.value.remark,
    scopes: scopes.map((item: BizPermScope, index: number) => ({
      scopeType: item.scopeType,
      scopeValue: String(item.scopeValue),
      scopeName: item.scopeName,
      includeChild: normalizeFlag(item.includeChild),
      orderNum: item.orderNum ?? index
    }))
  }
  if (payload.id) {
    await updatePolicy(payload)
    proxy?.$modal.msgSuccess('修改成功')
  } else {
    await addPolicy(payload)
    proxy?.$modal.msgSuccess('新增成功')
  }
  dialogOpen.value = false
  getPolicyList()
}

/** 删除（表格行） */
function handleDeleteRow(row: BizPermPolicy) {
  proxy?.$modal.confirm('是否确认删除场景「' + row.policyName + '」的权限策略？').then(() => {
    return delPolicy(row.id as number)
  }).then(() => {
    getPolicyList()
    proxy?.$modal.msgSuccess('删除成功')
  })
}

/** 批量删除 */
function handleDelete() {
  if (ids.value.length === 0) {
    return
  }
  proxy?.$modal.confirm('是否确认删除选中的 ' + ids.value.length + ' 条权限策略？').then(() => {
    return delPolicy(ids.value)
  }).then(() => {
    getPolicyList()
    proxy?.$modal.msgSuccess('删除成功')
  })
}

/* ---------------- 初始化 ---------------- */
/** 切换 Tab 时按需加载 */
function handleTabChange(name: string) {
  if (name === 'tree' && treeData.value.length === 0) {
    loadTree()
  } else if (name === 'list' && policyList.value.length === 0) {
    getPolicyList()
  } else if (name === 'user' && queryUserCode.value && userTreeData.value.length === 0) {
    loadUserTree()
  }
}

/** 加载人员 / 岗位 / 部门基础数据 */
function loadBaseOptions() {
  listUser({ pageNum: 1, pageSize: 50 } as any).then(res => {
    userOptions.value = res.rows || []
  })
  listPost({ pageNum: 1, pageSize: 200 } as any).then(res => {
    postOptions.value = res.rows || []
  })
  deptTreeSelect().then(res => {
    const data: any = res.data || []
    deptOptions.value = Array.isArray(data) ? data : [data]
  })
}

onMounted(() => {
  loadTree()
  loadBaseOptions()
})
</script>

<style scoped>
.perm-node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.perm-label.is-disabled {
  color: #c0c4cc;
  text-decoration: line-through;
}
</style>
