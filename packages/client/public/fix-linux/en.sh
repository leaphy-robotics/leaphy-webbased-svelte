LEAPHYCOLOR=$'\e[38;2;6;119;143m'
RESET=$'\e[0m'
BOLD=$'\e[1m'
RED=$'\e[38;2;255;0;0m'
CLEAR=$'\e[2J\e[H'
read -r -d '' BANNER << EOF
${LEAPHYCOLOR}EEEEEEE           EEEEEEEEEEEEEEE     EEEEEEEEEEE     EEEEEEEEEEEEEEEE  EEEEEEEE   EEEEEEE  EEEEEEE   EEEEEEEE
${LEAPHYCOLOR}EEEEEEE           EEEEEEEEEEEEEEE    EEEEEEEEEEEEE    EEEEEEEEEEEEEEEEE EEEEEEEE   EEEEEEE  EEEEEEE   EEEEEEEE
${LEAPHYCOLOR}EEEEEEE           EEEEEEE            EEEEEEEEEEEEEE   EEEEEEEEEEEEEEEEE EEEEEEEE   EEEEEEE  EEEEEEE   EEEEEEEE
${LEAPHYCOLOR}EEEEEEE           EEEEEEEEEEEEE     EEEEEEE EEEEEEE   EEEEEEEE  EEEEEEE EEEEEEEEEEEEEEEEEE  EEEEEEEE  EEEEEEEE
${LEAPHYCOLOR}EEEEEEE  EEEEEEE  EEEEEEEEEEEEE    EEEEEEE   EEEEEEE  EEEEEEEEEEEEEEEEE EEEEEEEEEEEEEEEEEE   EEEEEEEEEEEEEEEE
${LEAPHYCOLOR}EEEEEEE  EEEEEEE  EEEEEEEEEEEEE    EEEEEEEEEEEEEEEEEE EEEEEEEEEEEEEEEEE EEEEEEEEEEEEEEEEEE    EEEEEEEEEEEEEE  EEEE
${LEAPHYCOLOR}EEEEEEE  EEEEEEE  EEEEEEE          EEEEEEEEEEEEEEEEEE EEEEEEEEEEEEEEEE  EEEEEEEEEEEEEEEEEE     DEEEEEEEEEEEEEEEEEEEEEE
${LEAPHYCOLOR}EEEEEEEEEEEEEEEE  EEEEEEEEEEEEEEE  EEEEEEEEEEEEEEEEEE EEEEEEEE          EEEEEEEE   EEEEEEE       EEEEEEEE EEEEEEEEEEEEEE
${LEAPHYCOLOR}EEEEEEEEEEEEEEEE  EEEEEEEEEEEEEEE  EEEEEEE   EEEEEEEE EEEEEEEE          EEEEEEEE   EEEEEEE       EEEEEEEEEEEEEEEEEEEEE
${LEAPHYCOLOR}EEEEEEEEEEEEEEEE  EEEEEEEEEEEEEEE  EEEEEEE   EEEEEEE  EEEEEEEE           EEEEEEE   EEEEEEE       EEEEEEEE  EEEEEEE
${RESET}
EOF

cat << EOF
${CLEAR}${BANNER}
${LEAPHYCOLOR}[▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒]
                                                    ${BOLD}Removing brltty
${RESET}
EOF
sudo apt-get purge brltty -y > /dev/null 2>&1
sudo dnf remove brltty -y > /dev/null 2>&1
sudo pacman -R brltty --noconfirm > /dev/null 2>&1
sudo zypper remove brltty -y > /dev/null 2>&1

cat << EOF
${CLEAR}${BANNER}
${LEAPHYCOLOR}[███████████████████████████████████████████████████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒]
                                                   ${BOLD}Fixing permissions
${RESET}
EOF
sudo usermod -aG dialout,input,tty $USER > /dev/null 2>&1
curl -s https://content.arduino.cc/assets/arduino-udev-setup.sh | sudo bash > /dev/null 2>&1

cat << EOF
${CLEAR}${BANNER}
${LEAPHYCOLOR}[██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████]
                                                  ${RED}${BOLD}Done! Please reboot now.
${RESET}
EOF