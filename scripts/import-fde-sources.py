#!/usr/bin/env python3
"""Import the locally supplied FDE study pack without executing its Python files.

Usage: python3 scripts/import-fde-sources.py /path/to/fde-src --output /tmp/fde-import.json
The checked-in content is reviewed and expanded by hand; a fresh import must not replace it.
"""
import argparse
import ast
import json
import re
from pathlib import Path


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path)
parser.add_argument('--output', type=Path, help='write a raw import to a separate file for review')
args = parser.parse_args()
SOURCE = args.source
REVIEWED = Path(__file__).resolve().parents[1] / 'fde' / 'fde-prep.json'
DEST = args.output or REVIEWED
if DEST.resolve() == REVIEWED.resolve() and REVIEWED.exists():
    parser.error('refusing to overwrite reviewed FDE content; pass --output /tmp/fde-import.json to review a fresh import')


def read_nodes(filename):
    tree = ast.parse((SOURCE / filename).read_text(encoding='utf-8'))
    items = []
    for node in tree.body:
        if not isinstance(node, ast.Expr) or not isinstance(node.value, ast.Call):
            continue
        call = node.value
        if not isinstance(call.func, ast.Name):
            continue
        if call.func.id == 'A':
            try:
                items.append(ast.literal_eval(call.args[0]))
            except (ValueError, TypeError):
                pass
        elif call.func.id == 'Q':
            items.append(('iq', *[ast.literal_eval(arg) for arg in call.args]))
    return items


def read_memo():
    tree = ast.parse((SOURCE / 'memo_content.py').read_text(encoding='utf-8'))
    return {
        node.targets[0].id: ast.literal_eval(node.value)
        for node in tree.body
        if isinstance(node, ast.Assign)
        and isinstance(node.targets[0], ast.Name)
        and node.targets[0].id in {'JD', 'BE', 'RX', 'PITCH', 'RESCUE', 'ASK'}
    }


def clean(value):
    text = str(value).replace('—', '-').replace('–', '-')
    for old, new in {
        'I pinned the command and made CI replay it': 'the deploy command was fixed and CI was updated to replay it',
        'I pinned the command, made CI replay it from a clean checkout, wrote the lesson down, and later spotted the same risk in the API Dockerfile': 'the deployment command was fixed, CI was updated to replay it from a clean checkout, and a similar risk remains in the API Dockerfile',
        'I reproduced old failing and new passing on a clean clone': 'the old failing and new passing commands were checked on a clean clone',
        'I also found the API Dockerfile still uses the old command': 'the API Dockerfile still uses the old command',
        'I switched to the dependency-aware filter, added a CI job': 'the fix used a dependency-aware filter and added a CI job',
        'I do not quote numbers I do not have.': 'No unverified numbers are quoted.',
        'Mình ghim lệnh và cho CI chạy lại đúng lệnh đó': 'Lệnh deploy được sửa và CI được cập nhật để chạy lại đúng lệnh đó',
        'Mình ghim lệnh': 'Lệnh được ghim',
        'I later spotted the same risk': 'the same risk remains',
    }.items():
        text = text.replace(old, new)
    return re.sub(r'\s+', ' ', text).strip()


def local(en, vi):
    return {'en': clean(en), 'vi': clean(vi)}


def speakable(answer):
    return ' '.join(re.split(r'(?<=[.!?])\s+(?=[A-Z])', answer)[:2])


REQS = [
    ('connectors', 'Read-only connectors', 'Connector chỉ đọc', 'Read external changes into a local mirror with least-privilege access, pagination and a durable checkpoint.', 'Đọc thay đổi từ hệ ngoài vào bản sao nội bộ, chỉ xin quyền cần thiết, đọc đủ trang và lưu mốc đồng bộ an toàn.', 'Gmail, Monday and an unknown Evolve interface need separate adapters. AutoSyndic demonstrates OAuth, polling and cursor-based Gmail/Outlook intake, but not read-only scopes, retries or dedupe. Treat Monday GraphQL and Evolve integration as a proposed design until the client confirms access.', 'Gmail, Monday và Evolve chưa rõ giao diện cần adapter riêng. AutoSyndic có OAuth, polling và cursor Gmail/Outlook, nhưng scope chưa chỉ đọc, thiếu retry và chống trùng. Monday GraphQL và Evolve là thiết kế đề xuất, phải hỏi client về quyền truy cập.'),
    ('writeback', 'Controlled Monday write-back', 'Ghi ngược Monday có kiểm soát', 'One write gateway validates a reviewed board and column allow-list, logs each attempt, and never offers deletes.', 'Một cổng ghi kiểm tra danh sách board và cột được duyệt, lưu log từng lần thử và không có lệnh xóa.', 'Proposal, not existing repo code: accept only approved board and column IDs, validate values, persist a pending command and idempotency key, call Monday through a rate-limited worker, then record success or failure. A timeout after remote success needs reconciliation before replay. lil.p has default-deny guards and transactional audit on core publishing, but not universal atomic audit.', 'Đề xuất, không phải code đã làm: chỉ nhận board/cột được duyệt, kiểm dữ liệu, lưu lệnh pending và khóa chống trùng, worker giới hạn tốc độ gọi Monday rồi ghi thành công hoặc thất bại. Nếu timeout sau khi bên ngoài đã ghi, phải đối soát trước khi chạy lại. lil.p có guard mặc định chặn và audit trong giao dịch ở luồng publish chính, không phải mọi ghi đều nguyên tử.'),
    ('intake', 'Invention disclosure intake', 'Tiếp nhận khai báo sáng chế', 'Turn an inbound email into a reviewed ticket keyed by invention ID, then an approved Monday action row.', 'Biến email đến thành ticket theo mã sáng chế, có người kiểm tra rồi mới ghi dòng hành động vào Monday.', 'Proposal: mailbox connector -> queue -> rules-first ID extraction -> unique ticket by invention ID -> human review -> idempotent write command. Keep the original message ID as provenance; if the ID is ambiguous, stop and ask an operator. AutoSyndic already converts mail into work orders, but does not have an invention ID key and lacks retry/dedupe.', 'Đề xuất: connector email -> queue -> bóc mã bằng luật trước -> ticket unique theo mã sáng chế -> người duyệt -> lệnh ghi có khóa chống trùng. Giữ message ID để truy vết; mã mơ hồ thì chuyển người xử lý. AutoSyndic đã chuyển email thành công việc, nhưng không có khóa mã sáng chế và thiếu retry/chống trùng.'),
    ('milestones', 'Grant milestone lifecycle', 'Vòng đời mốc tài trợ', 'Use explicit states, guarded transitions and a scheduled deadline check to flag Monday reliably.', 'Dùng trạng thái rõ ràng, chuyển trạng thái có điều kiện và lịch kiểm deadline để gắn cờ lên Monday.', 'Proposal: define allowed transitions and owners, update status conditionally with a history row and outbox command in one database transaction, then reconcile the Monday flag. A Cloud Scheduler-triggered job checks deadlines once per window. lil.p versioned publishing offers a transaction example, not an existing grant workflow.', 'Đề xuất: định nghĩa chuyển trạng thái và người có quyền; cập nhật trạng thái có điều kiện, ghi lịch sử và outbox cùng giao dịch; sau đó đối soát cờ Monday. Job theo lịch kiểm hạn mỗi kỳ. lil.p có ví dụ publish theo giao dịch, chưa phải workflow grant.'),
    ('cockpit', 'Cockpit web app', 'Giao diện Cockpit', 'Build searchable ticket, milestone, connector health and write-log screens with clear loading and failure states.', 'Làm màn ticket, milestone, tình trạng connector và nhật ký ghi; trạng thái tải và lỗi phải rõ.', 'Treat server state as remote data and use Vue Query or TanStack Query to fetch and invalidate. Show what was attempted and whether the remote write is confirmed, rather than treating a timeout as a known failure. AutoSyndic uses Nuxt/Vue Query; lil.p uses Next/TanStack.', 'Dữ liệu server phải được fetch và invalidate qua Vue Query hoặc TanStack Query. Hiện rõ lệnh đã thử và có xác nhận ghi bên ngoài chưa, đừng xem timeout là thất bại chắc chắn. AutoSyndic dùng Nuxt/Vue Query; lil.p dùng Next/TanStack.'),
    ('pillars', 'Repeat the pattern across pillars', 'Lặp mẫu qua các mảng nghiệp vụ', 'Share a canonical record and pipeline while configuring source-specific adapters and pillar-specific rules.', 'Dùng chung dạng dữ liệu và pipeline, tách adapter theo nguồn và luật riêng cho từng mảng.', 'Patent management, licensing and agreements, and finance and compliance share ingestion, validation, dedupe and review. Each integration still needs explicit mappings, permissions and tests. AutoSyndic has two mailbox sources but some processors are duplicated; lil.p shares Zod contracts. Avoid abstracting before two real use cases.', 'Patent, hợp đồng và cấp phép, tài chính và tuân thủ cùng cần đọc, kiểm tra, chống trùng và duyệt. Mỗi nguồn vẫn cần ánh xạ, quyền và test riêng. AutoSyndic có hai nguồn email nhưng processor còn lặp; lil.p chia sẻ Zod contract. Đừng trừu tượng hóa quá sớm.'),
    ('client', 'Client repository and PR workflow', 'Làm trong repo của khách qua PR', 'Clarify ownership and acceptance criteria, then send small tested PRs with a verification path and runbook.', 'Chốt trách nhiệm và tiêu chí trước; gửi PR nhỏ có test, cách kiểm và runbook.', 'Follow the client repository conventions, ask which system owns each field and who approves writes, and document rollback. A daily check-in across Singapore hours should report progress, risks and decisions. In lil.p a deploy build broke when CI did not replay the actual deploy command; the lesson is to test the production build path.', 'Theo quy ước repo khách; hỏi hệ nào sở hữu từng trường và ai duyệt việc ghi; ghi cách rollback. Check-in mỗi ngày theo giờ Singapore: tiến độ, rủi ro, quyết định. Ở lil.p từng có build deploy lỗi do CI không chạy đúng lệnh deploy; bài học là kiểm chính đường build triển khai.'),
    ('operations', 'Tests, runbooks and basic GCP hosting', 'Test, runbook và triển khai GCP cơ bản', 'Test connector edge cases and describe a GCP deployment plan without claiming production GCP experience.', 'Test ca khó của connector và trình bày kế hoạch GCP, không nhận mình từng vận hành production trên GCP.', 'General knowledge and proposal: Cloud Run for API and worker, Cloud Scheduler for periodic jobs, Pub/Sub for delivery, Cloud SQL for relational state, Secret Manager for application secrets, Cloud Logging for structured logs. Encrypt customer OAuth tokens in storage; do not assume Secret Manager replaces per-customer encryption. I have not run production on GCP. AutoSyndic shipped without automated tests; lil.p has unit, API e2e and Playwright tests.', 'Kiến thức chung và kế hoạch: Cloud Run chạy API/worker, Cloud Scheduler kích job, Pub/Sub chuyển việc, Cloud SQL giữ dữ liệu quan hệ, Secret Manager giữ secret ứng dụng, Cloud Logging lưu log có cấu trúc. Token OAuth của khách cần mã hóa khi lưu, Secret Manager không tự thay cho mã hóa từng token. Tôi chưa vận hành production trên GCP. AutoSyndic chưa có test tự động; lil.p có unit, API e2e và Playwright.'),
]

CONCEPTS_EN = [
    ('What a connector does', 'A server-side adapter reads a remote system and converts its records to a stable local shape. Unlike a frontend fetch, it runs without a user present and must remember progress. Store the last confirmed checkpoint only after the local batch commits.'),
    ('OAuth and refresh tokens', 'The user consents on the provider site; the backend exchanges a one-use code for a short-lived access token and an optional long-lived refresh token. Refresh on the server, not in the browser. Encrypt stored customer tokens, handle revoked consent and prevent concurrent refresh races.'),
    ('Read-only scopes', 'Ask the provider for the narrowest read scopes and expose no mutation path inside the connector. Permissions are a second layer: the write-back service uses different credentials and a separate reviewed allow-list. AutoSyndic currently requests sending permission, so this is a hardening proposal.'),
    ('Polling and push notifications', 'Polling checks on a schedule and works without a public webhook, at the cost of latency and repeat requests. Push is quicker but subscriptions expire and notices can be duplicated or missed. Use push as a doorbell to read from a durable cursor, plus a periodic reconciliation poll.'),
    ('Cursor and delta synchronization', 'A cursor marks the last safely processed change. Read all pages, upsert by external ID, and advance the checkpoint only after durable enqueue or storage. If Gmail history is stale, backfill a time window and dedupe; AutoSyndic currently logs a stale cursor without recovery.'),
    ('NestJS request pipeline', 'Middleware assigns request context, guards authorize, pipes validate, and dependency injection wires the service. These are like route middleware and validation in Nuxt, except the server must enforce every permission itself. Restrict the write endpoint regardless of what buttons the UI hides.'),
    ('Default-deny allow-list', 'A reviewed map of board IDs and column IDs limits what the write gateway can change. Reject unknown boards, columns and delete operations before calling Monday. This allow-list is proposed design, not existing code in either project; lil.p demonstrates default-deny role guards.'),
    ('Zod contract for outbound values', 'Parse an incoming command against schemas for each allowed column before the external call. Share types between UI and API where useful, but trust the server-side parser, not client validation. lil.p already shares Zod contracts for its own API, not Monday.'),
    ('Transactions and the audit log', 'A database transaction atomically stores the local command, status and audit entry; it cannot make the Monday HTTP call atomic with the database. Persist pending first, send once through a worker, mark the result, and reconcile ambiguous timeouts. lil.p core publishing audits in its transaction; smaller writes have gaps.'),
    ('Dry run and approval', 'A dry run validates mappings and shows proposed changes without calling the provider. For risky writes, an operator reviews the diff before the gateway sends it. AutoSyndic already requires approval before outgoing messages, but a Monday dry-run is a proposal.'),
    ('Queues and background jobs', 'A queue separates fast intake from slow external API work. A worker claims a job, fetches context and saves the result; a deterministic job ID reduces duplicates. Job queues alone do not guarantee exactly-once side effects, so add a database uniqueness constraint.'),
    ('Retry and backoff', 'Retry transient failures such as 429 and 5xx with bounded exponential backoff and jitter; honor server retry hints. Do not retry validation errors. Record the final failure for manual investigation. AutoSyndic currently has no configured retry or dedupe.'),
    ('Idempotency', 'Repeating the same input should have the same effect: use a deterministic job ID, unique database key and outbound command key. A remote timeout may have happened after success, so check remote state before replay. These keys are design proposals, not existing AutoSyndic code.'),
    ('Business ID and deduplication', 'A message ID identifies one email; an invention ID identifies the real business case. Keep a unique ticket on invention ID and attach later emails to it, while deduping messages by mailbox and message ID. If extraction is uncertain, ask a human rather than guessing.'),
    ('State machine basics', 'A state machine lists valid statuses and who may move between them, preventing accidental jumps. For a grant milestone, distinguish draft, review, approved and completed from overdue flags. Define ownership of status before syncing any flag back to Monday.'),
    ('Transactional transitions', 'A proposed transition(status, event) checks the current state, conditionally updates it, appends history and an outbox write command in one transaction. Two workers racing on the same state cannot both win. Monday is updated asynchronously and reconciled afterward.'),
    ('What the projects actually implement', 'AutoSyndic has a few work-order statuses and a manual approval gate; lil.p has versioned publishing with transactional audit for core writes. Neither implements a grant milestone lifecycle. Discuss them as analogies rather than a completed grant system.'),
    ('Time-based triggers', 'A scheduled job scans milestones whose deadlines are due and emits one idempotent transition command per milestone and window. The database owns state; the scheduler only triggers a check. Avoid running in-process cron in every scaled API instance.'),
    ('Server state versus client state', 'Server state is shared remote data that can change elsewhere, so cache and refetch it. Client state is local UI state such as an open panel. A Cockpit should show stale, pending and failed remote writes explicitly, not infer success from a local button click.'),
    ('TanStack Query and Vue Query', 'Both manage keyed server fetches, cache and invalidation. Vue Query fits the Nuxt/Vue experience in AutoSyndic; TanStack Query fits lil.p React/Next. Make filter values part of query keys and invalidate affected keys after an approved mutation.'),
    ('Refreshing concurrent requests', 'When many requests see an expired access token, share one in-flight refresh promise instead of rotating tokens many times. Queue callers behind it, retry eligible requests once, and redirect on a failed refresh. lil.p has a refreshOnce pattern; do not store tokens in browser localStorage.'),
    ('Cockpit screens', 'Proposed screens: inbox and ticket detail with invention ID and evidence; milestone timeline and deadline flags; connector health with cursor and errors; write-log with pending, confirmed, failed and ambiguous states. Show permission-gated actions and readable mobile layouts.'),
    ('Adapter pattern', 'Each source implements fetch and normalization into a canonical record while one pipeline handles validation, dedupe and persistence. A new pillar adds a mapping and rule set, not a copy of every worker. AutoSyndic has duplicated mailbox processors, so this is a suggested refactor.'),
    ('Shared contracts', 'Use typed schemas to describe canonical records, write commands and pillar configuration. Validate configuration on startup so bad mappings fail early. lil.p shares Zod contracts between frontend and backend; the cross-pillar contract is a proposed extension.'),
    ('Test layers', 'Unit tests exercise parsers and transitions; integration tests cover uniqueness, outbox and database transaction; contract tests replay external API fixtures; end-to-end tests cover an operator approval. AutoSyndic has no automated tests, while lil.p has unit, API e2e and Playwright coverage.'),
    ('Runbooks', 'A runbook names symptoms, checks, safe recovery and escalation for an on-call person. Cover revoked tokens, stale Gmail history, Monday rate limits, ambiguous writes, failed migration and rollback. Never replay an uncertain write without checking the remote outcome.'),
    ('Observability', 'Log structured request, connector, command and correlation IDs without tokens or message bodies. Track sync lag, retry counts and unresolved writes, and alert when a cursor stalls. lil.p has request IDs and health checks; JSON logs and tracing on GCP remain a proposal.'),
    ('GCP building blocks', 'This is general knowledge, not production experience: Cloud Run hosts containerized API and worker; Scheduler triggers periodic checks; Pub/Sub delivers events; Cloud SQL stores relational state; Secret Manager holds app secrets; Logging collects structured events. Run migrations separately and limit service-account permissions.'),
    ('Matching CI to deployment', 'lil.p had a deployment build failure because CI did not replay the exact deployment command. A follow-up changed the build filter and added a CI job for that command. In a client repo, run the same production build in a clean checkout and document rollback; do not claim every possible deployment path is verified.'),
]

CHAPTER_REQ = ['connectors', 'writeback', 'intake', 'milestones', 'cockpit', 'pillars', 'operations']
entries = []


def add(identifier, section, requirement, title, short, points, detail, tags):
    entries.append({
        'id': identifier, 'section': section, 'jdRequirement': requirement,
        'tags': tags, 'title': title, 'shortAnswer': short,
        'keyPoints': points, 'detail': detail,
    })


for requirement, en, vi, short_en, short_vi, detail_en, detail_vi in REQS:
    add(f'jd-{requirement}', 'jd', requirement, local(en, vi), local(short_en, short_vi),
        [local(clean(part), clean(other)) for part, other in zip(detail_en.split('. ')[:3], detail_vi.split('. ')[:3])],
        local('What and why: ' + short_en + '\nHow and tradeoffs: ' + detail_en,
              'Khái niệm và lý do: ' + short_vi + '\nCách làm và đánh đổi: ' + detail_vi),
        [requirement, 'JD', 'design'])


chapter = 0
section = None
concept_index = 0
concepts = []
for item in read_nodes('content_b.py'):
    kind = item[0]
    if kind == 'h1':
        if section:
            concepts.append((chapter, section))
        chapter += 1
        section = None
    elif kind == 'h2':
        if section:
            concepts.append((chapter, section))
        section = {'heading': item[1], 'content': [], 'pitfalls': []}
    elif section:
        if kind == 'p':
            section['content'].append(item[1])
        elif kind == 'ul':
            section['content'].extend(item[1])
        elif kind == 'flow':
            section['content'].append('Luồng: ' + item[1])
        elif kind == 'code':
            section['content'].append('Thiết kế hoặc ví dụ minh họa:\n' + item[1])
        elif kind == 'table':
            section['content'].extend(' | '.join(map(str, row)) for row in item[2])
        elif kind == 'box':
            (section['pitfalls'] if item[1] == 'pit' else section['content']).append(item[2])
if section:
    concepts.append((chapter, section))

assert len(concepts) == len(CONCEPTS_EN) == 29
for chapter, section in concepts:
    en_title, en_body = CONCEPTS_EN[concept_index]
    concept_index += 1
    requirement = CHAPTER_REQ[chapter - 1]
    req = next(row for row in REQS if row[0] == requirement)
    vi_body = '\n'.join(map(clean, section['content']))
    pitfalls = ' '.join(map(clean, section['pitfalls']))
    first_vi = clean(section['content'][0]) if section['content'] else req[4]
    en_sentences = re.split(r'(?<=\.)\s+', en_body)
    add(f'concept-{chapter}-{concept_index}', 'concepts', requirement,
        local(en_title, section['heading']), local(en_sentences[0], first_vi),
        [local(en_sentences[min(index, len(en_sentences) - 1)], clean(section['content'][min(index, len(section['content']) - 1)]) if section['content'] else first_vi) for index in range(min(3, len(en_sentences)))],
        local('What and why: ' + en_body + '\nHow it fits this role: ' + req[5] + '\nTradeoffs and pitfalls: Confirm permissions, retries, ambiguous outcomes and system ownership before claiming completion.',
              'Khái niệm và cách hoạt động: ' + vi_body + '\nĐánh đổi và lỗi thường gặp: ' + (pitfalls or req[6]) + '\nLiên hệ dự án: ' + req[6]),
        [requirement, 'theory', en_title.lower()])


def guess_req(text):
    query = clean(text).lower()
    for requirement, terms in [
        ('operations', ['gcp', 'deploy', 'test', 'runbook', 'cloud', 'incident', 'production issue', 'monitor', 'logs']),
        ('client', ['client repo', 'pull request', 'singapore', 'remote', 'communicat', 'requirement', 'behavio']),
        ('milestones', ['milestone', 'state machine', 'deadline', 'grant']),
        ('writeback', ['write-back', 'write back', 'audit', 'allow-list', 'monday write', 'double-click']),
        ('intake', ['invention', 'email', 'duplicate', 'dedup', 'idempotent']),
        ('cockpit', ['cockpit', 'react', 'vue', 'frontend', 'tanstack', 'ui', 'render', 'hydration']),
        ('pillars', ['pillar', 'contract', 'adapter']),
    ]:
        if any(term in query for term in terms):
            return requirement
    return 'connectors'


interview_number = 0
for item in read_nodes('content_c.py'):
    if item[0] != 'iq':
        continue
    interview_number += 1
    _, en, vi, why, short_vi, short_en, detail_vi, detail_en = item
    requirement = guess_req(en)
    requirement_row = next(row for row in REQS if row[0] == requirement)
    if interview_number in {26, 28, 29}:
        detail_en = [*detail_en, 'TODO (điền chi tiết thật): confirm your personal actions and outcome before telling this as a STAR story.']
        detail_vi = [*detail_vi, 'TODO (điền chi tiết thật): xác nhận hành động và kết quả của chính bạn trước khi kể chuyện STAR.']
    if interview_number == 30:
        detail_en = [*detail_en, 'Do not claim authorship of PR #205 or ownership of the incident without confirming your personal role.']
        detail_vi = [*detail_vi, 'Không nhận mình là tác giả PR #205 hoặc người trực tiếp xử lý sự cố khi chưa xác nhận vai trò thật.']
    add(f'I{interview_number}', 'interview', requirement, local(en, vi), local(short_en, short_vi),
        [local(en_point, vi_point) for en_point, vi_point in zip(detail_en, detail_vi)],
        local('Why they ask: ' + requirement_row[5] + '\nAnswer in detail: ' + '\n'.join(detail_en),
              'Vì sao họ hỏi: ' + why + '\nTrả lời chi tiết: ' + '\n'.join(detail_vi)),
        ['I', requirement, 'interview'])

memo = read_memo()
for prefix, key in [('J', 'JD'), ('B', 'BE'), ('R', 'RX')]:
    for number, (en, vi, answer, gist) in enumerate(memo[key], 1):
        requirement = guess_req(en + ' ' + answer)
        req = next(row for row in REQS if row[0] == requirement)
        concept = next((entry for entry in entries if entry['section'] == 'concepts' and entry['jdRequirement'] == requirement), None)
        points = [local(answer, gist)]
        if concept:
            points.append(local(concept['shortAnswer']['en'], concept['shortAnswer']['vi']))
        points.append(local(req[3], req[4]))
        add(f'{prefix}{number}', 'interview', requirement, local(en, vi), local(speakable(answer), gist),
            points,
            local('Direct answer: ' + answer + '\nBackground and how it works: ' + (concept['detail']['en'] if concept else req[5]) + '\nHonest boundary: ' + req[5],
                  'Trả lời trực tiếp: ' + gist + '\nGiải thích cho người làm FE: ' + (concept['detail']['vi'] if concept else req[6]) + '\nĐiều cần nói thật: ' + req[6]),
            [prefix, requirement, 'interview'])

A_TITLES_VI = [
    'Hãy kể về một connector bạn đã làm.',
    'Vì sao dùng polling thay vì webhook? Nếu mất cursor thì sao?',
    'Bạn sẽ thiết kế dịch vụ ghi ngược Monday an toàn thế nào?',
    'Mọi thao tác quản trị trong lil.p đều ghi audit trong cùng giao dịch sao?',
    'Nếu người vận hành bấm Duyệt hai lần thì sao?',
    'Bạn sẽ áp dụng cách làm này cho intake sáng chế thế nào?',
    'Nếu cùng email bị xử lý hai lần thì sao?',
    'Bạn sẽ mô hình hóa vòng đời mốc tài trợ thế nào?',
    'Bạn phân biệt trạng thái từ server và trạng thái giao diện thế nào?',
    'Nếu token hết hạn khi có mười request đang chạy thì sao?',
    'Có thêm mảng nghiệp vụ thứ ba, bạn tránh sao chép code thế nào?',
    'Bạn đã test các hệ thống đó thế nào?',
    'Kể về một lỗi triển khai bạn từng phân tích.',
    'Có thể chạy hai instance API không? Bạn sẽ đưa lên GCP thế nào?',
    'Làm sao giữ dữ liệu giữa các người dùng tách biệt?',
]

for item in read_nodes('content.py'):
    if item[0] != 'q':
        continue
    _, number, en, vi_answer, en_answer = item
    requirement = guess_req(en)
    req = next(row for row in REQS if row[0] == requirement)
    add(f'A{number}', 'interview', requirement, local(en, A_TITLES_VI[number - 1]), local(en_answer, vi_answer),
        [local(req[3], req[4])], local(en_answer + '\nContext: ' + req[5], vi_answer + '\nBối cảnh: ' + req[6]),
        ['A', requirement, 'interview'])

for index, (en, vi) in enumerate(memo['PITCH'], 1):
    add(f'pitch-{index}', 'pitch', 'client', local(f'Pitch chunk {index}', f'Đoạn giới thiệu {index}'),
        local(en, vi), [local(en, vi)], local(en, vi), ['pitch', 'intro'])
for index, en in enumerate(memo['RESCUE'], 1):
    vi = ['Để tôi trả lời đúng ý, anh/chị muốn hỏi về thiết kế hay cách xử lý lỗi?', 'Cho tôi nghĩ thành tiếng một chút và bắt đầu từ luồng dữ liệu.', 'Tôi chưa làm đúng trường hợp đó, nhưng đây là cách tôi sẽ tiếp cận và điều tôi sẽ kiểm tra trước.'][index - 1]
    add(f'rescue-{index}', 'rescue', 'client', local(f'Rescue phrase {index}', f'Câu gỡ bí {index}'),
        local(en, vi), [local(en, vi)], local('Use this to pause and clarify without claiming experience you do not have.', 'Dùng câu này để dừng lại, hỏi rõ và không nhận mình đã làm điều chưa làm.'), ['rescue'])
for index, en in enumerate(memo['ASK'], 1):
    vi = ['Hiện Evolve cung cấp API, file xuất hay quyền truy cập DB trực tiếp?', 'Ai duyệt danh sách board/cột được ghi trên Monday, và thay đổi được đưa lên production thế nào?', 'Tháng đầu tiên làm tốt vị trí này sẽ có kết quả gì?'][index - 1]
    add(f'ask-{index}', 'ask', 'client', local(f'Ask the interviewer {index}', f'Hỏi nhà tuyển dụng {index}'),
        local(en, vi), [local(en, vi)], local('This clarifies source contracts, approval ownership or the role expectations.', 'Câu hỏi giúp xác định hợp đồng dữ liệu, người duyệt hoặc kỳ vọng công việc.'), ['ask'])

pitch_en = ' '.join(clean(row[0]) for row in memo['PITCH'])
pitch_vi = ' '.join(clean(row[1]) for row in memo['PITCH'])
add('cheat-sheet', 'cheat', 'client', local('One-screen cheat sheet', 'Tờ nhắc nhanh một màn hình'),
    local(pitch_en, pitch_vi), [local(en, vi) for en, vi in memo['PITCH']],
    local('Pitch: ' + pitch_en + '\nRescue: ' + ' | '.join(memo['RESCUE']) + '\nAsk: ' + ' | '.join(memo['ASK']),
          'Giới thiệu: ' + pitch_vi + '\nGỡ bí: ' + ' | '.join(entry['shortAnswer']['vi'] for entry in entries if entry['section'] == 'rescue') + '\nHỏi: ' + ' | '.join(entry['shortAnswer']['vi'] for entry in entries if entry['section'] == 'ask')),
    ['cheat', 'pitch'])

payload = {'version': 1, 'requirements': [dict(id=row[0], title=local(row[1], row[2])) for row in REQS], 'entries': entries}
DEST.parent.mkdir(parents=True, exist_ok=True)
DEST.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Wrote {len(entries)} FDE entries to {DEST}')
