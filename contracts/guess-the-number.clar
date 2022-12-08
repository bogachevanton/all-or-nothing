;; Errors
(define-constant ERR_GUESSING_NOT_ACTIVE (err u101))
(define-constant ERR_REACHED_BLOCK_PICK_LIMIT (err u102))
(define-constant ERR_NO_MONEY (err u103))
(define-constant ERR_ZERO_OR_MAX (err u104))
(define-constant ERR_OVER_LIMIT (err u105))

;; Variables
(define-data-var guess-price uint u0)
(define-data-var last-guess-id uint u0)
(define-data-var prize-pool uint u0)
(define-data-var guess-participants uint u0)
(define-data-var guess-active bool true)
(define-data-var guessing-winner (optional principal) none)
(define-data-var a int 0)
(define-data-var b int 0)
(define-data-var c int 0)
(define-data-var d int 0)
(define-data-var e int 0)
(define-data-var f int 0)
(define-data-var g int 0)
(define-data-var subtract-n1 int 0)
(define-data-var subtract-n2 int 0)
(define-data-var winner-number int 0)
(define-data-var winner uint u0)

;; Storage
(define-map guesses { 
                        guess-id: uint 
                    }
                    { 
                        number-of-participants: uint,
                        player: principal,
                        number: int
                    }
)

;; Functions
;; Choose number and make a guess in uSTX
(define-public (choose-number (price uint) (participants uint) (user-number int))    
    (begin
        (asserts! (var-get guess-active) ERR_GUESSING_NOT_ACTIVE)
        (asserts! (> (stx-get-balance tx-sender) price) ERR_NO_MONEY)
        (asserts! (and (> participants u1) (< participants u3)) ERR_ZERO_OR_MAX)
        (asserts! (< user-number 101) ERR_OVER_LIMIT)
        (if (<= (var-get last-guess-id) u0)
                (and (var-set guess-price price) (var-set guess-participants participants))
                false
        )
        (try! (stx-transfer? (var-get guess-price) tx-sender (as-contract tx-sender)))
        (map-set guesses { guess-id: (var-get last-guess-id) } { number-of-participants: (var-get guess-participants), player: tx-sender, number: user-number })
        (if (< (var-get last-guess-id) (- (var-get guess-participants) u1))
            (begin
                (var-set last-guess-id (+ (var-get last-guess-id) u1))
                (ok true)
            )
            (begin
                (try! (pick-number))
                (try! (find-winner-number))
                (ok true)
            )
        )       
    )
)

;; Find a winner player number
(define-private (find-winner-number)
    (begin
        (var-set a (unwrap-panic (get number (map-get? guesses (tuple (guess-id u0))))))
        (var-set b (unwrap-panic (get number (map-get? guesses (tuple (guess-id u1))))))
        (var-set c (to-int (var-get picked-number))) 
        (var-set d (- (var-get c) (var-get a)))
        (var-set e (- (var-get a) (var-get c)))
        (var-set f (- (var-get c) (var-get b)))
        (var-set g (- (var-get b) (var-get c)))
        (if (> (var-get d) 0)
            (var-set subtract-n1 (var-get d))
            (var-set subtract-n1 (var-get e))
        )
        (if (> (var-get f) 0)
            (var-set subtract-n2 (var-get f))
            (var-set subtract-n2 (var-get g))
        )
        (if (is-eq (var-get subtract-n1) (var-get subtract-n2))
            (begin 
                (try! (as-contract (stx-transfer? (var-get guess-price) tx-sender (unwrap-panic (get player (map-get? guesses (tuple (guess-id u0))))))))
                (try! (as-contract (stx-transfer? (var-get guess-price) tx-sender (unwrap-panic (get player (map-get? guesses (tuple (guess-id u1))))))))
                (print "Draw")
                (ok true)
            )
            (begin 
                (if (< (var-get subtract-n1) (var-get subtract-n2))
                    (and (var-set winner-number (var-get a)) (var-set winner u0))
                    (and (var-set winner-number (var-get b)) (var-set winner u1))
                )
                (var-set guess-active (not (var-get guess-active)))
                (var-set prize-pool (* (+ (var-get last-guess-id) u1) (var-get guess-price)))
                (var-set guessing-winner (get player (map-get? guesses (tuple (guess-id (var-get winner))))))
                (try! (as-contract (stx-transfer? (var-get prize-pool) tx-sender (unwrap-panic (var-get guessing-winner)))))
                (print "You are a winner")
                (ok true)
            )
        )
    )
)

;; Check guessing flag
(define-read-only (guessing-enabled)
    (ok (var-get guess-active))
)

;; Guess price in uSTX
(define-read-only (get-price-in-ustx)
    (ok (var-get guess-price))
)

;; Get number of participants
(define-read-only (get-number-of-participants)
    (ok (var-get guess-participants))
)

;; Get guess info by ID
(define-read-only (get-guess-info (id uint))
    (ok (map-get? guesses (tuple (guess-id id))))
)

;; Prize pool in uSTX
;; Max guess ID * Price = Prize Pool
(define-read-only (get-prize-pool-in-ustx)
    (ok
        (*
            (+ (var-get last-guess-id) u1)
            (var-get guess-price)
        )
    )
)

;; Pick winner a winner player number
(define-constant BUFF_TO_BYTE (list
    0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a 0x0b 0x0c 0x0d 0x0e 0x0f
    0x10 0x11 0x12 0x13 0x14 0x15 0x16 0x17 0x18 0x19 0x1a 0x1b 0x1c 0x1d 0x1e 0x1f 
    0x20 0x21 0x22 0x23 0x24 0x25 0x26 0x27 0x28 0x29 0x2a 0x2b 0x2c 0x2d 0x2e 0x2f
    0x30 0x31 0x32 0x33 0x34 0x35 0x36 0x37 0x38 0x39 0x3a 0x3b 0x3c 0x3d 0x3e 0x3f
    0x40 0x41 0x42 0x43 0x44 0x45 0x46 0x47 0x48 0x49 0x4a 0x4b 0x4c 0x4d 0x4e 0x4f
    0x50 0x51 0x52 0x53 0x54 0x55 0x56 0x57 0x58 0x59 0x5a 0x5b 0x5c 0x5d 0x5e 0x5f 
    0x60 0x61 0x62 0x63 0x64 0x65 0x66 0x67 0x68 0x69 0x6a 0x6b 0x6c 0x6d 0x6e 0x6f
    0x70 0x71 0x72 0x73 0x74 0x75 0x76 0x77 0x78 0x79 0x7a 0x7b 0x7c 0x7d 0x7e 0x7f
    0x80 0x81 0x82 0x83 0x84 0x85 0x86 0x87 0x88 0x89 0x8a 0x8b 0x8c 0x8d 0x8e 0x8f
    0x90 0x91 0x92 0x93 0x94 0x95 0x96 0x97 0x98 0x99 0x9a 0x9b 0x9c 0x9d 0x9e 0x9f
    0xa0 0xa1 0xa2 0xa3 0xa4 0xa5 0xa6 0xa7 0xa8 0xa9 0xaa 0xab 0xac 0xad 0xae 0xaf
    0xb0 0xb1 0xb2 0xb3 0xb4 0xb5 0xb6 0xb7 0xb8 0xb9 0xba 0xbb 0xbc 0xbd 0xbe 0xbf 
    0xc0 0xc1 0xc2 0xc3 0xc4 0xc5 0xc6 0xc7 0xc8 0xc9 0xca 0xcb 0xcc 0xcd 0xce 0xcf 
    0xd0 0xd1 0xd2 0xd3 0xd4 0xd5 0xd6 0xd7 0xd8 0xd9 0xda 0xdb 0xdc 0xdd 0xde 0xdf 
    0xe0 0xe1 0xe2 0xe3 0xe4 0xe5 0xe6 0xe7 0xe8 0xe9 0xea 0xeb 0xec 0xed 0xee 0xef
    0xf0 0xf1 0xf2 0xf3 0xf4 0xf5 0xf6 0xf7 0xf8 0xf9 0xfa 0xfb 0xfc 0xfd 0xfe 0xff
)
)

;; Variables
(define-data-var picked-number uint u0)
(define-data-var limit-numbers uint u100)
(define-data-var last-block uint u0)
(define-data-var last-vrf (buff 64) 0x51e5e1) ;;change to 0x00 - mainnet
(define-data-var b-idx uint u0)

;; Storage
(define-map chosen-ids
    uint
    uint
)

;; Pick winner in guessing with RNG based on VRF
(define-private (pick-number)
    (let 
        ((byte-idx (var-get b-idx)))
            (begin
                ;;(set-vrf) delete ';;' - mainnet
                (asserts!
                    (< byte-idx u62) ERR_REACHED_BLOCK_PICK_LIMIT
                )
                (let
                    (
                        (picked-idx (mod (rand byte-idx) (var-get limit-numbers)))
                        (picked-id (default-to picked-idx (map-get? chosen-ids picked-idx)))
                    )
                    (var-set last-block block-height)
                    (var-set b-idx (+ (var-get b-idx) u2))
                    (var-set picked-number picked-id)
                    (ok picked-id)
                )
            )
    )
)

;; Set VRF from previous block
(define-private (set-vrf)
    (var-set last-vrf (sha512 (unwrap-panic (get-block-info? vrf-seed (- block-height u1)))))
)

;; Converting byte to uint
(define-private (rand (byte-idx uint))
    (let
        ((vrf (var-get last-vrf)))
        (+ 
            (* 
                (unwrap-panic (index-of BUFF_TO_BYTE (unwrap-panic (element-at vrf byte-idx))))
                u256
            )
            (unwrap-panic (index-of BUFF_TO_BYTE (unwrap-panic (element-at vrf (+ byte-idx u1)))))
        )
    )
)

;; Get winner number
(define-read-only (get-picked-number)
    (ok (var-get picked-number))
)

;; Get raffle limit in guess
(define-read-only (get-raffle-limit)
    (ok (var-get limit-numbers))
)